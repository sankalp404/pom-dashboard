package com.tollgrade.cable.ccms.service.pomdashboard;

import com.adventnet.nms.util.NmsUtil;
import com.tollgrade.cable.ccms.cttreeapi.CTTreeMO;
import com.tollgrade.cable.ccms.service.CTWebServices.CTSummaryScreenData;
import com.tollgrade.cable.ccms.service.battAdmin.CTOutageMgrConstants;
import org.json.JSONArray;
import org.hibernate.criterion.DetachedCriteria;
import org.hibernate.criterion.Restrictions;
import com.tollgrade.cable.ccms.ctlogging.CTLog4j;
import com.tollgrade.cable.ccms.devicemodel.hfccommon.CTTransponder;
import com.tollgrade.cable.ccms.devicemodel.common.CTMOConst;
import com.tollgrade.cable.ccms.util.CTRMIAPIUtil;
import com.tollgrade.cable.ccms.util.CTBEAPIUtil;
import com.tollgrade.cable.ccms.service.battAdmin.CTPSOutageInfo;
import com.tollgrade.cable.ccms.service.poweroutagemonitoring.CTPomHistoricalTrackingEntry;
import com.tollgrade.cable.ccms.cttreeapi.CTMobileMO;
import com.tollgrade.cable.ccms.hibernate.util.CTHibernateUtil;
import com.adventnet.management.transaction.ConnectionPool;
import com.adventnet.nms.topodb.ManagedObject;
import org.json.JSONObject;

import java.util.*;
import java.util.List;
import java.sql.Connection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.tollgrade.cable.ccms.service.CTWebServices.CTMobileWebServices.DOMAIN_POWER;

public class CTPOMDashboardUtils
{
    private String region = null;
    private String area = null;
    private String hub = null;
    private String nodeName =null;
    private String treeName=CTMOConst.POM_TREE;
    private CTLog4j log;
    private ConnectionPool cp = null;
    private String userName = null;

    public CTPOMDashboardUtils(String treeName, String region, String area, String  hub, CTLog4j log, String userName) throws Exception
    {
        this.treeName = treeName;
        this.log = log;
        this.userName = userName;
        this.region = region;
        if (area != null && !area.equals(""))
        {
            this.area = area;
        }
        if (hub != null && !hub.equals(""))
        {
           this.hub = hub;
        }
        if (this.hub != null)
        {
            nodeName = hub;
        }
        else if (this.area != null)
        {
            nodeName = area;
        }
        else
        {
            nodeName = region;
        }
        cp = ConnectionPool.getInstance();
    }

    public Connection getConnection()
    {
        if (cp == null)
        {
            cp = ConnectionPool.getInstance();
        }
        return cp.getConnection();
    }

    public static List<String> getPOMDevicesForFilteredRegion(String treeName, String hName, CTLog4j log)
    {
        List devicesInTree = new ArrayList();
        try
        {
            if (!treeName.equals(CTMOConst.POM_TREE))
            {
                // in this case it's always a device name passed in, not the display name.
                devicesInTree = CTBEAPIUtil.getTreeAPI().fetchChildrenOfType(treeName,hName,"Transponder");
            }
            else
            {
                // get all the containers below the passed in argument in the pom tree
                // in this case the hubName may be passed in as a display name. We need the real name for the fetchChildren call.
                String hubName = hName;
                boolean isDeviceName =  CTBEAPIUtil.getTopoAPI(log).isManagedObjectPresent(hName);

                // if the devicename is not present, this is a display name. Go get the device name for the fetchChildren
                // call.
                if (!isDeviceName)
                {
                    Properties props = new Properties();
                    props.put("displayName",hName);
                    List<String> hubsWithDisplayName = CTBEAPIUtil.getTopoAPI(log).getObjectNamesWithProps(props);
                    if (hubsWithDisplayName == null || hubsWithDisplayName.size() == 0)
                    {
                        return devicesInTree;
                    }
                    hubName = hubsWithDisplayName.get(0);
                }
                List pomContainers = CTBEAPIUtil.getTreeAPI().fetchChildren(treeName, hubName, 0, 4);
                StringBuilder searchString = new StringBuilder();
                if (!hubName.equals(treeName+"root"))
                {
                   searchString.append(hubName);
                    if (pomContainers != null && pomContainers.size() > 0)
                    {
                        searchString.append(",");
                    }
                }
                if (pomContainers != null && pomContainers.size() > 0)
                {
                    Iterator iter = pomContainers.iterator();
                    int i = 0;
                    while (iter.hasNext())
                    {
                        CTMobileMO childMo = (CTMobileMO) iter.next();
                        searchString.append(childMo.getDisplayName());
                        if (i < pomContainers.size() - 1)
                        {
                            searchString.append(",");
                        }
                        i++;
                    }
                }
                log.logDebug("SearchString: "+searchString.toString());
                // retrieve the names of all the transponders that have one of the containers in the selected hierarchy
                // as their parent.
                Properties props = new Properties();
                props.put("classname","CTHMSTransponder,CTTransponder,CTCLTransponder");
                props.put("hubContainer",searchString.toString());
                devicesInTree.addAll(CTBEAPIUtil.getTopoAPI().getObjectNamesWithProps(props));

            }
        }
        catch (Exception e)
        {
            log.logException("Error retrieving POM devices for filtered region "+"::"+treeName+"::"+hName,e);
        }
        return devicesInTree;
    }

    public List<JSONObject> getPOMDrilldownDataLive(int severity){
        List<JSONObject> jsonObjectList = new ArrayList<JSONObject>();

        // get a list of all power supplies that are children of the filter tree and node
        List devices = getPOMDevicesForFilteredRegion(treeName, nodeName, log);
        log.logDebug("Devices In the Iter: " + devices.toString());
        Iterator iter = devices.iterator();

        // get the current list of POM outages
        Map pomMap =  getCurrentPomMap();
        log.logDebug("POM MAP: " + pomMap.toString());

        // get a list of all devices currently in outage
        Set outageDevices = pomMap.keySet();
        log.logDebug("Outage Devices: " + outageDevices.toString());

         /*
        If the device is not in the pomMap list of outages, it’s severity =1.
        If it’s in the list and communicating, it’s severity = 2.
        If it’s not communicating it’s severity == 3 (which is a thisDevice.getStatus() – 1).
        */

        // iterate all devices, figure out what category they belong to and create JSON
          while (iter.hasNext())
          {
              CTTransponder thisDevice = null;
              String deviceName = (String) iter.next();
              try{

                thisDevice = CTBEAPIUtil.getCTTopoAPI().fetchSkinnyCTTransponderByName(deviceName);

                if(!outageDevices.contains(deviceName) && severity == 1) {
                    // If device is not in outage, add the JSON object here, otherwise add more properties to the object.
                    JSONObject jsonObject = new JSONObject();
                    jsonObject.put("displayName", thisDevice.getDisplayName());
                    jsonObject.put("location", thisDevice.getLocation());
                    jsonObject.put("ip_address", thisDevice.getIpAddress());
                    jsonObject.put("mac_address", thisDevice.getMacAddress());
                    jsonObject.put("gen_attached", thisDevice.getIsGenAttached() == 1);
                    jsonObjectList.add(jsonObject);
                    log.logDebug("In POM Chart Drilldown with no outage::"+ thisDevice);
                }
                else if(severity > 1 && outageDevices.contains(deviceName))
                {
                    CTPSOutageInfo pomInfo = (CTPSOutageInfo) pomMap.get(deviceName);

                    JSONObject jsonObject = new JSONObject();
                    jsonObject.put("displayName", thisDevice.getDisplayName());
                    jsonObject.put("location", thisDevice.getLocation());
                    jsonObject.put("ip_address", thisDevice.getIpAddress());
                    jsonObject.put("mac_address", thisDevice.getMacAddress());
                    jsonObject.put("gen_attached", thisDevice.getIsGenAttached() == 1);
                    jsonObject.put("gen_status", getGenStatus(pomInfo.getGenStatus()));
                    jsonObject.put("standby_remaining", pomInfo.getStdbyEstimate());
                    jsonObject.put("gen_elapsed_runtime", pomInfo.getGenElapsedRuntime());
                    jsonObject.put("standby_status", pomInfo.isDeviceInStdby() );
                    jsonObject.put("input_voltage", pomInfo.getLastInputVoltage());
                    jsonObject.put("dispatch_time", pomInfo.getDispatchTime());
                    jsonObject.put("event_start_time", pomInfo.getOutageStartTime());
                    jsonObject.put("gen_refuel_time", pomInfo.getGenRefuelTime());
                    if (pomInfo.isDeviceInStdby())
                    {
                        // is it communicating. If yes and severity sent in was YELLOW
                        if (pomInfo.isFlgIsDeviceCommunicating() && severity == 2)
                        {
                            log.logDebug("In POM Chart Drilldown, device in standby::"+ thisDevice);
                            jsonObjectList.add(jsonObject);
                        }
                        // it is not communicating and severity sent was RED
                        else if (!pomInfo.isFlgIsDeviceCommunicating() && severity == 3)
                        {
                            log.logDebug("In POM Chart Drilldown, device has lost communication::"+ thisDevice);
                            jsonObjectList.add(jsonObject);
                        }
                    }
                    // may not be able to read standby if not communicating.
                    else if (!pomInfo.isFlgIsDeviceCommunicating() && severity == 3)
                    {
                        log.logDebug("In POM Chart Drilldown, device has lost communication::"+ thisDevice);
                        jsonObjectList.add(jsonObject);
                    }
                }

            }catch (Exception e){
                log.logException("Error retrieving current POMDashboardDrilldownLive data while looping through devices for "+"::"+deviceName+"::"+ nodeName,e);
            }
        }
        return jsonObjectList;
    }


    public JSONObject getRegionsAreasHubs()
    {
        JSONObject pomTreeJson =  new JSONObject();
        try
        {
            // this will get the entire pomTree
            List<CTTreeMO> pomTree = CTBEAPIUtil.getTreeAPI().fetchTree(treeName);
            JSONArray regions = null;
            JSONArray areas = null;
            JSONArray hubs = null;
            JSONObject regionObject = null;
            JSONObject areaObject = null;
           // JSONArray hubArray = null;
            for (CTTreeMO pTree: pomTree)
            {
                if (pTree.getDeviceName().equals(pomTree+"root")) continue;
                // region
                if (pTree.getLevel() == 2)
                {
                    if (hubs != null && areaObject != null)
                    {
                        areaObject.put("hubs",hubs);
                    }
                    if (areas != null && regionObject != null)
                    {
                        regionObject.put("areas",areas);
                    }
                    areaObject = null;
                   // hubArray = null;
                    areas = null;
                    hubs = null;
                    regionObject = new JSONObject();
                    regionObject.put("regionName", pTree.getDisplayName());
                    if (regions == null) regions = new JSONArray();
                    regions.put(regionObject);
                }
                //are
                else if (pTree.getLevel() == 3)
                {
                    if (hubs != null && areaObject != null)
                    {
                        areaObject.put("hubs",hubs);
                    }
                   // hubArray = null;
                    hubs = null;
                    areaObject = new JSONObject();
                    areaObject.put("areaName", pTree.getDisplayName());
                    if (areas == null) areas = new JSONArray();
                    areas.put(areaObject);
                }
                //hub
                else if (pTree.getLevel() == 4)
                {
                   // hubArray = new JSONArray();
                   // hubs.put(pTree.getDisplayName());
                    if (hubs == null) hubs = new JSONArray();
                    hubs.put(pTree.getDisplayName());
                }
            }
            if (hubs != null && areaObject != null)
            {
                areaObject.put("hubs",hubs);
            }
            if (areas != null && regionObject != null)
            {
                regionObject.put("areas",areas);
            }
            if (regions != null)
            {
               pomTreeJson.put("regions", regions);
            }
        }
        catch (Exception e)
        {
            log.logException("Error retrieving current POMDashboard regions/area/hubs",e);
        }

        return pomTreeJson;
    }

    /**
     * Gets all the info needed for the realtime POM Dashboard map. Returns a JSONARRAY of the info.
     * @return
     */
    public JSONObject getPOMDashboardRealtime()
    {
        JSONObject responseObject = new JSONObject();
        List<JSONObject> mapMarkers = new ArrayList();
        int greenOutages=0;
        int yellowOutages=0;
        int redOutages=0;


        // Key is name of region, area hub...value is a MAP of red, yellow, green and counts for each
        Map<String, Map<String, Integer>> groupPieCharts = new HashMap();

        try
        {
            // get the current list of POM outages
            Map pomMap =  getCurrentPomMap();
            log.logDebug("POM MAP: " + pomMap.toString());


            // this will get the entire pomTree
            List<CTTreeMO> pomTree = CTBEAPIUtil.getTreeAPI().fetchTree(treeName);
            // find the level that the passed in treeNode is at. The level below it is the level the pie charts will be
            // built from. Region/area/hub = levels 2/3/4

            int pieChartLevel = findParentNodeLevel(nodeName, pomTree);
            if (pieChartLevel < 4)
            {
                pieChartLevel++;
            }
            // hub level is max
            else
            {
                pieChartLevel = 4;
            }


            // map of hubs to areas (or regions, depending on pie chart level) for fast lookup
            Map<String, String> hubToPieChartMap = new HashMap();

            // get a list of all power supplies that are children of the filter tree and node
            List devicesInTree = getPOMDevicesForFilteredRegion(treeName, nodeName, log);

            log.logDebug("Devices In the Iter: " + devicesInTree.toString());


            Iterator iter2 = devicesInTree.iterator();
            // get a list of all devices currently in outage
            Set outageDevices = pomMap.keySet();

            log.logDebug("Outage Devices: " + outageDevices.toString());

            // iterate all devices, figure out what category they belong to and create JSON
            while (iter2.hasNext())
            {
                CTTransponder thisDevice = null;
                String dName = (String) iter2.next();
                try{
                    // CTTransponder will contain name, displayName, ipAddress, macAddress, hubContainer, location and any other
                    // device-specific info needed for the JSON and map
                    thisDevice = CTBEAPIUtil.getCTTopoAPI().fetchSkinnyCTTransponderByName(dName);

                    log.logDebug("Iterating through: " + thisDevice);

                    // Create one JSON object per device/marker.
                    JSONObject mapObject = new JSONObject();
                    int deviceSeverity;

                    mapObject.put("device_name", thisDevice.getName());
                    mapObject.put("display_name", thisDevice.getDisplayName());
                    mapObject.put("ip_address", thisDevice.getIpAddress());
                    mapObject.put("mac_address", thisDevice.getMacAddress());
                    mapObject.put("gen_attached", thisDevice.getIsGenAttached() == 1 ? true : false);

                    // Parse out the Latitude and Longitude from the location
                    String location = thisDevice.getLocation();
                    String lat = "";
                    String lng = "";

                    log.logDebug("Location: " + location);

                    if (location != null){
                        Pattern p = Pattern.compile("\\(-*[0-9.\\-]+,-*[0-9.]+\\)$");
                        String defLatLngNoSpaces = location.replaceAll(" ","");
                        Matcher m = p.matcher(defLatLngNoSpaces);
                        boolean match = m.find();
                        if (match)
                        {
                            String latLngMatch = m.group();
                            String sLat = latLngMatch.substring(1,latLngMatch.indexOf(","));
                            String sLng = latLngMatch.substring(latLngMatch.indexOf(",")+1,
                                                                latLngMatch.indexOf(")"));
                            log.logDebug("Lat: " + sLat);
                            log.logDebug("Lng: " + sLng);

                            lat = String.valueOf(Double.parseDouble(sLat));
                            lng = String.valueOf(Double.parseDouble(sLng));
                        }
                        log.logDebug("Lat: " + lat);
                        log.logDebug("Lng: " + lng);
                    }

                    mapObject.put("location", location);
                    mapObject.put("latitude", lat);
                    mapObject.put("longitude", lng);

                    String hubContainer = thisDevice.getHubContainer();

                    // pieChartGroupName will contain the name of the pieChart this device will be included in.
                    String pieChartGroupName;
                    if (!hubToPieChartMap.containsKey(hubContainer))
                    {
                        String hubParent = findHubParent(hubContainer, pieChartLevel, nodeName, pomTree);
                        hubToPieChartMap.put(hubContainer, hubParent);
                        pieChartGroupName = hubParent;
                    }
                    else
                    {
                        pieChartGroupName = hubToPieChartMap.get(hubContainer);
                    }

                    // if a new hub, create a new entry in the map and populate with zeros for all categories
                    if (!groupPieCharts.containsKey(pieChartGroupName))
                    {
                        Map<String, Integer> defaultPieCharts = new HashMap();
                        defaultPieCharts.put("Green",0);
                        defaultPieCharts.put("Yellow",0);
                        defaultPieCharts.put("Red",0);
                        groupPieCharts.put(pieChartGroupName,defaultPieCharts);
                    }
                    // if it's not in outage list it is green
                    if (!outageDevices.contains(dName))
                    {
                        Map<String, Integer> pieCharts = groupPieCharts.get(pieChartGroupName);
                        int greenValue = pieCharts.get("Green");
                        pieCharts.put("Green", greenValue+1);
                        groupPieCharts.put(pieChartGroupName,pieCharts);
                        deviceSeverity = 1;
                    }
                    // else it is in the outage map
                    else
                    {
                        // get the outage info for the device
                        CTPSOutageInfo pomInfo = (CTPSOutageInfo) pomMap.get(dName);

                        mapObject.put("gen_status", getGenStatus(pomInfo.getGenStatus()));
                        mapObject.put("standby_remaining", pomInfo.getStdbyEstimate());
                        mapObject.put("elapsed_runtime", pomInfo.getGenElapsedRuntime());

                        // if it's currently in standby
                        if (pomInfo.isDeviceInStdby())
                        {
                            // is it communicating. If yes, it is YELLOW
                            if (pomInfo.isFlgIsDeviceCommunicating())
                            {
                                deviceSeverity = 2;
                                Map<String, Integer> pieCharts = groupPieCharts.get(pieChartGroupName);
                                int yellowValue = pieCharts.get("Yellow");
                                pieCharts.put("Yellow", yellowValue+1);
                                groupPieCharts.put(pieChartGroupName,pieCharts);

                            }
                            // it is not communicating. it is RED
                            else
                            {
                                deviceSeverity = 4;
                                Map<String, Integer> pieCharts = groupPieCharts.get(pieChartGroupName);
                                int redValue = pieCharts.get("Red");
                                pieCharts.put("Red", redValue+1);
                                groupPieCharts.put(pieChartGroupName,pieCharts);

                            }
                        }
                        // it is not communicating and cannot read standby value. it is RED
                        else if (!pomInfo.isFlgIsDeviceCommunicating())
                        {
                            deviceSeverity = 4;
                            Map<String, Integer> pieCharts = groupPieCharts.get(pieChartGroupName);
                            int redValue = pieCharts.get("Red");
                            pieCharts.put("Red", redValue+1);
                            groupPieCharts.put(pieChartGroupName,pieCharts);

                        }

                        // in outage map but not in standby. Mark as GREEN
                        else
                        {
                            deviceSeverity = 1;
                            Map<String, Integer> pieCharts = groupPieCharts.get(pieChartGroupName);
                            int greenValue = pieCharts.get("Green");
                            pieCharts.put("Green", greenValue+1);
                            groupPieCharts.put(pieChartGroupName,pieCharts);

                        }
                    }

                    mapObject.put("severity", deviceSeverity);
                    mapMarkers.add(mapObject);
                }
                catch (Exception e){
                    log.logException("Error retrieving current POMDashboard Real time while looping through devices for "+"::"+dName+"::"+ nodeName,e);
                }

            }

            // create the JSON Objects for the hub pie charts
            Set hubs = groupPieCharts.keySet();
            List<JSONObject> pieChartList  = new ArrayList();
            Iterator iter = hubs.iterator();
            while (iter.hasNext())
            {
                String hubName = (String) iter.next();
                Map<String, Integer> pieCharts = groupPieCharts.get(hubName);

                int green = pieCharts.get("Green");
                int yellow = pieCharts.get("Yellow");
                int red = pieCharts.get("Red");

                // Keep track of total outages for the Bar Chart
                greenOutages += green;
                yellowOutages += yellow;
                redOutages += red;

                JSONObject pieChart = new JSONObject();
                pieChart.put("name", hubName);

                JSONArray values = new JSONArray();
                values.put(green);
                values.put(yellow);
                values.put(red);

                pieChart.put("values", values);

                pieChartList.add(pieChart);
            }

            // Order is preserved in JSONArray - Sankalp
            JSONArray outagesChart = new JSONArray();

            JSONObject greenOutageObject = new JSONObject();
            greenOutageObject.put("name", "No outages");
            greenOutageObject.put("value", greenOutages);

            JSONObject yellowOutageObject = new JSONObject();
            yellowOutageObject.put("name", "In Standby");
            yellowOutageObject.put("value", yellowOutages);

            JSONObject redOutageObject = new JSONObject();
            redOutageObject.put("name", "Not Communicating");
            redOutageObject.put("value", redOutages);

            outagesChart.put(greenOutageObject);
            outagesChart.put(yellowOutageObject);
            outagesChart.put(redOutageObject);

            responseObject.put("outages", outagesChart);
            responseObject.put("pie_charts", new JSONArray(pieChartList));
            responseObject.put("devices", new JSONArray(mapMarkers));

            CTSummaryScreenData runtimeChart = new CTSummaryScreenData(DOMAIN_POWER, treeName, nodeName, log);
            responseObject.put("runtime_remaining_chart", runtimeChart.getPSOutages());
            setLastConfig();

        }
        catch (Exception e)
        {
            log.logException("Error retrieving current POMDashboardRealtime for "+"::"+treeName+"::"+ nodeName,e);
        }
        return responseObject;
    }


    public JSONObject getLastConfig()
    {
        JSONObject lastConfig = new JSONObject();
        try
        {

           Properties props = CTBEAPIUtil.getCTTopoAPI().fetchConfigSettingsAsProperties("pomDashboard",
                 "pomDashboard", userName);
           if (props.containsKey("lastSelectedRegion"))
           {
               lastConfig.put("region",(String) props.get("lastSelectedRegion"));
           }
            if (props.containsKey("lastSelectedArea"))
            {
                lastConfig.put("area",(String) props.get("lastSelectedArea"));
            }
            if (props.containsKey("lastSelectedHub"))
            {
                lastConfig.put("hub",(String) props.get("lastSelectedHub"));
            }
        }
        catch (Exception eee)
        {

        }
        return lastConfig;
    }

    private void setLastConfig()
    {
        String tregion = "";
        String tarea = "";
        String thub = "";

        try
        {
            if (region != null)
            {
                tregion = region;
            }
            if (area != null)
            {
                tarea = area;
            }
            if (hub != null)
            {
                thub = hub;
            }
            Properties props = new Properties();
            props.put("lastSelectedRegion", tregion);
            props.put("lastSelectedArea", tarea);
            props.put("lastSelectedHub", thub);
            CTBEAPIUtil.getCTTopoAPI().saveOrUpdateConfigSettingsProperties("pomDashboard",
                 "pomDashboard", userName, props);
        }
        catch (Exception eee)
        {

        }
    }

    private int findParentNodeLevel(String nodeToFind, List<CTTreeMO> pomTree)
    {
        log.logDebug("In find ParentNodeLevel: " + nodeToFind);

        int level = 4;
        for (CTTreeMO pomNode: pomTree)
        {
            log.logDebug("POM Node: " + pomNode.getDeviceName());

            if (pomNode.getDisplayName().equals(nodeToFind))
            {
                level = pomNode.getLevel();
                break;
            }
        }

        return level;
    }

    private String findHubParent(String hubContainer, int level, String nodeName, List<CTTreeMO> pomTree)
    {
        int treeSize = pomTree.size()-1;
        boolean foundHub = false;
        boolean inBranch = false;
        int foundLevel = 4;
        for (int i = treeSize; i >= 0; i--)
        {
            CTTreeMO pomNode = pomTree.get(i);
            String node = pomNode.getDisplayName();
            int nodeLevel = pomNode.getLevel();
            if (!foundHub && hubContainer.equals(node))
            {
                foundHub = true;
            }

            if (foundHub)
            {
                if (nodeLevel == level)
                {
                    return node;
                }
            }

            if (node.equals(nodeName))
            {
                return nodeName;
            }
        }
        return nodeName;

    }

    /**
     * Gets all the info needed for the historical POM Dashboard map. Returns a JSONARRAY of the info.
     * @return
     */
    public JSONObject getPOMDashboardHistorical(String startTime, String stopTime)
    {
        JSONObject responseObject = new JSONObject();
        List<JSONObject> mapMarkers = new ArrayList();
        // Key is name of region, area hub...value is a MAP of red, yellow, orange, green and counts for each
        Map<String, Map<String, Integer>> groupPieCharts = new HashMap();
        int greenOutages=0;
        int yellowOutages=0;
        int redOutages=0;
        int orangeOutages=0;

        try
        {
            // this will get the entire pomTree
            List<CTTreeMO> pomTree = CTBEAPIUtil.getTreeAPI().fetchTree(treeName);
            // find the level that the passed in treeNode is at. The level below it is the level the pie charts will be
            // built from. Region/area/hub = levels 2/3/4
            int pieChartLevel = findParentNodeLevel(nodeName, pomTree);
            if (pieChartLevel < 4)
            {
                pieChartLevel++;
            }
            // hub level is max
            else
            {
                pieChartLevel = 4;
            }
            // map of hubs to areas (or regions, depending on pie chart level) for fast lookup
            Map<String, String> hubToPieChartMap = new HashMap();

            long lStartTime = Long.parseLong(startTime);
            long lStopTime = Long.parseLong(stopTime);
            // get the historical list of POM outages
            Map<String, List<CTPomHistoricalTrackingEntry>> pomMap =  getHistoricalPomEntries(nodeName,lStartTime, lStopTime);
            // get a list of all power supplies that are children of the filter tree and node
            List devicesInTree = getPOMDevicesForFilteredRegion(treeName, nodeName, log);
            Iterator iter2 = devicesInTree.iterator();
            // get a list of all devices currently in outage
            Set outageDevices = pomMap.keySet();

            // iterate all devices, figure out what category they belong to and create JSON
            while (iter2.hasNext())
            {
                CTTransponder thisDevice = null;
                String dName = (String) iter2.next();
                try{

                    // CTTransponder will contain name, displayName, ipAddress, macAddress, hubContainer, location and any other
                    // device-specific info needed for the JSON and map
                    thisDevice = CTBEAPIUtil.getCTTopoAPI().fetchSkinnyCTTransponderByName(dName);

                    log.logDebug("Iterating through: " + thisDevice);

                    JSONObject mapObject = new JSONObject();
                    int deviceSeverity=1;

                    mapObject.put("device_name", thisDevice.getName());
                    mapObject.put("display_name", thisDevice.getDisplayName());
                    mapObject.put("ip_address", thisDevice.getIpAddress());
                    mapObject.put("mac_address", thisDevice.getMacAddress());

                    // Parse out the Latitude and Longitude from the location
                    String location = thisDevice.getLocation();
                    String lat = "";
                    String lng = "";

                    log.logDebug("Location: " + location);

                    if (location != null){
                        Pattern p = Pattern.compile("\\(-*[0-9.\\-]+,-*[0-9.]+\\)$");
                        String defLatLngNoSpaces = location.replaceAll(" ","");
                        Matcher m = p.matcher(defLatLngNoSpaces);
                        boolean match = m.find();
                        if (match)
                        {
                            String latLngMatch = m.group();
                            String sLat = latLngMatch.substring(1,latLngMatch.indexOf(","));
                            String sLng = latLngMatch.substring(latLngMatch.indexOf(",")+1,
                                                                latLngMatch.indexOf(")"));
                            log.logDebug("Lat: " + sLat);
                            log.logDebug("Lng: " + sLng);

                            lat = String.valueOf(Double.parseDouble(sLat));
                            lng = String.valueOf(Double.parseDouble(sLng));
                        }
                        log.logDebug("Lat: " + lat);
                        log.logDebug("Lng: " + lng);
                    }

                    mapObject.put("location", location);
                    mapObject.put("latitude", lat);
                    mapObject.put("longitude", lng);

                    String hubContainer = thisDevice.getHubContainer();

                    // pieChartGroupName will contain the name of the pieChart this device will be included in.
                    String pieChartGroupName;
                    if (!hubToPieChartMap.containsKey(hubContainer))
                    {
                        String hubParent = findHubParent(hubContainer, pieChartLevel, nodeName, pomTree);
                        hubToPieChartMap.put(hubContainer, hubParent);
                        pieChartGroupName = hubParent;
                    }
                    else
                    {
                        pieChartGroupName = hubToPieChartMap.get(hubContainer);
                    }

                    // if a new hub, create a new entry in the map and populate with zeros for all categories
                    if (!groupPieCharts.containsKey(pieChartGroupName))
                    {
                        Map<String, Integer> defaultPieCharts = new HashMap();
                        defaultPieCharts.put("Green",0);
                        defaultPieCharts.put("Yellow",0);
                        defaultPieCharts.put("Red",0);
                        defaultPieCharts.put("Orange",0);
                        groupPieCharts.put(pieChartGroupName,defaultPieCharts);
                    }
                    // if it's not in outage list it is green
                    if (!outageDevices.contains(dName))
                    {
                        Map<String, Integer> pieCharts = groupPieCharts.get(pieChartGroupName);
                        int greenValue = pieCharts.get("Green");
                        pieCharts.put("Green", greenValue+1);
                        groupPieCharts.put(pieChartGroupName,pieCharts);
                        deviceSeverity = 1;
                    }
                    // else it is in the outage map
                    else
                    {
                        // get the outage info for the device
                        List<CTPomHistoricalTrackingEntry> pomInfos = pomMap.get(dName);
                        int maxSeverity = 0;
                        CTPomHistoricalTrackingEntry pomInfo = null;
                        int numOutagesForThisDevice = 0;
                        // find the outage of max severity for this device
                        for (CTPomHistoricalTrackingEntry pi: pomInfos)
                        {
                            numOutagesForThisDevice++;
                            if (pi.getSeverity() > maxSeverity)
                            {
                                maxSeverity = pi.getSeverity();
                                pomInfo = pi;
                            }
                        }
                        mapObject.put("gen_status", getGenStatus(pomInfo.getGenStatus()));
                        mapObject.put("gen_startTime", pomInfo.getGenStartTime());
                        mapObject.put("gen_stopTime", pomInfo.getGenStopTime());
                        mapObject.put("elapsed_runtime", pomInfo.getGenElapsedRuntime());
                        // is it communicating. If yes, it is YELLOW
                        if (pomInfo.getSeverity() == 2)
                        {
                            Map<String, Integer> pieCharts = groupPieCharts.get(pieChartGroupName);
                            int yellowValue = pieCharts.get("Yellow");
                            pieCharts.put("Yellow", yellowValue+1);
                            groupPieCharts.put(pieChartGroupName,pieCharts);
                            /** create JSON Object for YELLOW map object
                             **/
                        }
                        // it is not communicating but it passed the timespan test
                        else if (pomInfo.getSeverity() == 3)
                        {
                            Map<String, Integer> pieCharts = groupPieCharts.get(pieChartGroupName);
                            int orangeValue = pieCharts.get("Orange");
                            pieCharts.put("Orange", orangeValue+1);
                            groupPieCharts.put(pieChartGroupName,pieCharts);
                            /** create JSON Object for ORANGE map object
                             **/
                        }
                        // it is not communicating and failed the timespan test
                        else if (pomInfo.getSeverity() == 4)
                        {
                            Map<String, Integer> pieCharts = groupPieCharts.get(pieChartGroupName);
                            int orangeValue = pieCharts.get("Red");
                            pieCharts.put("Red", orangeValue+1);
                            groupPieCharts.put(pieChartGroupName,pieCharts);
                            /** create JSON Object for ORANGE map object
                             **/

                        }
                        deviceSeverity = maxSeverity;
                    }
                    mapObject.put("severity", deviceSeverity);
                    mapMarkers.add(mapObject);
                }
                catch (Exception e){
                    log.logException("Error retrieving current POMDashboard Historical while looping through devices for "+"::"+dName+"::"+ nodeName,e);
                }


            }

            // create the JSON Objects for the hub pie charts
            Set hubs = groupPieCharts.keySet();
            List<JSONObject> pieChartList  = new ArrayList();
            Iterator iter = hubs.iterator();
            while (iter.hasNext())
            {
                String hubName = (String) iter.next();
                Map<String, Integer> pieCharts = groupPieCharts.get(hubName);

                int green = pieCharts.get("Green");
                int yellow = pieCharts.get("Yellow");
                int red = pieCharts.get("Red");
                int orange = pieCharts.get("Orange");

                // Keep track of total outages for the Bar Chart
                greenOutages += green;
                yellowOutages += yellow;
                redOutages += red;
                orangeOutages += orange;

                JSONObject pieChart = new JSONObject();
                pieChart.put("name", hubName);

                JSONArray values = new JSONArray();
                values.put(green);
                values.put(yellow);
                values.put(orange);
                values.put(red);

                pieChart.put("values", values);

                pieChartList.add(pieChart);
            }

            // Order is preserved in JSONArray - Sankalp
            JSONArray outagesChart = new JSONArray();

            JSONObject greenOutageObject = new JSONObject();
            greenOutageObject.put("name", "No outages");
            greenOutageObject.put("value", greenOutages);

            JSONObject yellowOutageObject = new JSONObject();
            yellowOutageObject.put("name", "In Standby");
            yellowOutageObject.put("value", yellowOutages);

            JSONObject orangeOutageObject = new JSONObject();
            orangeOutageObject.put("name", "Not Communicating");
            orangeOutageObject.put("value", orangeOutages);

            JSONObject redOutageObject = new JSONObject();
            redOutageObject.put("name", "Not Communicating and Failed test");
            redOutageObject.put("value", redOutages);

            outagesChart.put(greenOutageObject);
            outagesChart.put(yellowOutageObject);
            outagesChart.put(orangeOutageObject);
            outagesChart.put(redOutageObject);

            responseObject.put("outages", outagesChart);
            responseObject.put("pie_charts", new JSONArray(pieChartList));
            responseObject.put("devices", new JSONArray(mapMarkers));
            setLastConfig();
        }
        catch (Exception e)
        {
            log.logException("Error retrieving current POMDashboardRealtime for "+"::"+treeName+"::"+ nodeName,e);
        }
        return responseObject;
    }

    public List<JSONObject> getPOMDrilldownDataHistorical(String startTime, String stopTime, int severity){

        List<JSONObject> jsonObjectList = new ArrayList<JSONObject>();

        long lStartTime = Long.parseLong(startTime);
        long lStopTime = Long.parseLong(stopTime);

        // get the historical list of POM outages
        Map<String, List<CTPomHistoricalTrackingEntry>> pomMap =  getHistoricalPomEntries(nodeName,lStartTime, lStopTime);
        log.logDebug("POM MAP: " + pomMap.toString());

        // get a list of all power supplies that are children of the filter tree and node
        List devices = getPOMDevicesForFilteredRegion(treeName, nodeName, log);
        Iterator iter = devices.iterator();
        log.logDebug("Devices In the Iter: " + devices.toString());

        // get a list of all devices currently in outage
        Set outageDevices = pomMap.keySet();
        log.logDebug("Outage Devices: " + outageDevices.toString());


         // iterate all devices, figure out what category they belong to and create JSON
           while (iter.hasNext())
           {
               CTTransponder thisDevice;
               String deviceName = (String) iter.next();
               try{

                 thisDevice = CTBEAPIUtil.getCTTopoAPI().fetchSkinnyCTTransponderByName(deviceName);
                 JSONObject jsonObject = new JSONObject();

                 if(!outageDevices.contains(deviceName) && severity == 1) {
                     // If device is not in outage history, add the JSON object here, otherwise add more properties to the object.

                     jsonObject.put("displayName", thisDevice.getDisplayName());
                     jsonObject.put("location", thisDevice.getLocation());
                     jsonObject.put("ip_address", thisDevice.getIpAddress());
                     jsonObject.put("mac_address", thisDevice.getMacAddress());
                     jsonObject.put("gen_attached", thisDevice.getIsGenAttached() == 1);
                     jsonObjectList.add(jsonObject);
                     log.logDebug("In POM Chart Drilldown with no outage::"+ thisDevice);
                 }
                 else if(severity > 1 && outageDevices.contains(deviceName))
                 {

                     List<CTPomHistoricalTrackingEntry> pomInfos = pomMap.get(deviceName);

                     int maxSeverity = 0;
                     CTPomHistoricalTrackingEntry pomInfo = null;

                     // find the outage of max severity for this device
                     for (CTPomHistoricalTrackingEntry pi: pomInfos)
                     {
                         if (pi.getSeverity() > maxSeverity)
                         {
                             maxSeverity = pi.getSeverity();
                             pomInfo = pi;
                         }
                     }

                     jsonObject.put("displayName", thisDevice.getDisplayName());
                     jsonObject.put("location", thisDevice.getLocation());
                     jsonObject.put("ip_address", thisDevice.getIpAddress());
                     jsonObject.put("mac_address", thisDevice.getMacAddress());
                     jsonObject.put("gen_attached", thisDevice.getIsGenAttached() == 1);

                     jsonObject.put("gen_status", getGenStatus(pomInfo.getGenStatus()));
                     jsonObject.put("gen_startTime", pomInfo.getGenStartTime());
                     jsonObject.put("gen_stopTime", pomInfo.getGenStopTime());
                     jsonObject.put("gen_elapsed_runtime", pomInfo.getGenElapsedRuntime());
                     jsonObject.put("gen_string_volts", pomInfo.getStringVolts());
                     jsonObject.put("gen_input_volts", pomInfo.getInputVolts());
                     jsonObject.put("gen_output_volts", pomInfo.getOutputVolts());
                     jsonObject.put("gen_output_current", pomInfo.getOutputCurrent());
                     jsonObject.put("temperature", pomInfo.getTemperature());

                     if (pomInfo.getSeverity() == 2 && severity == 2)
                     {
                         log.logDebug("In POM Chart Drilldown, device in standby::"+ deviceName);
                         jsonObjectList.add(jsonObject);
                     }
                     // it is not communicating but it passed the timespan test
                     else if (pomInfo.getSeverity() == 3 && severity == 3)
                     {
                         log.logDebug("In POM Chart Drilldown, device has lost communication::"+ deviceName);
                         jsonObjectList.add(jsonObject);
                     }
                     // it is not communicating and failed the timespan test
                     else if (pomInfo.getSeverity() == 4 && severity == 4)
                     {
                         log.logDebug("In POM Chart Drilldown, device has lost communication::"+ deviceName);
                         jsonObjectList.add(jsonObject);
                     }

                 }

             }catch (Exception e){
                 log.logException("Error retrieving getPOMDrilldownDataHistorical data while looping through devices for "+"::"+deviceName+"::"+ nodeName,e);
             }
         }
         return jsonObjectList;
     }

    private Map getCurrentPomMap()
    {
      Map pMap = new Hashtable();
      try
      {
        if (CTRMIAPIUtil.getBattAdminAPI().getActiveDevicesBeingMonitored() > 0)
        {
            pMap = CTRMIAPIUtil.getBattAdminAPI().getTasksTable();
        }
      }
      catch (Exception pome)
      {
          log.logVerbose("Error getting Current POM Map"+pome.toString());
      }
      return pMap;
    }

    private Map<String, List<CTPomHistoricalTrackingEntry>> getHistoricalPomEntries(String hubName, long startTime, long stopTime)
    {
        List<CTPomHistoricalTrackingEntry> pomEntries = new ArrayList();
        Map<String, List<CTPomHistoricalTrackingEntry>> pomMap = new HashMap();
        try
        {
            // get all the containers below the passed in argument in the pom tree
            List pomContainers = CTBEAPIUtil.getTreeAPI().fetchChildren(treeName, hubName, 0, 4);
            List searchString = new ArrayList();
            if (!hubName.equals(treeName+"root"))
            {
                searchString.add(hubName);
            }
            if (pomContainers != null && pomContainers.size() > 0)
            {
                Iterator iter = pomContainers.iterator();
                while (iter.hasNext())
                {
                    CTMobileMO childMo = (CTMobileMO) iter.next();
                    searchString.add(childMo.getDisplayName());
                }
            }
            DetachedCriteria c = DetachedCriteria.forClass(CTPomHistoricalTrackingEntry.class);
            c.add(Restrictions.in("hub", searchString));
            c.add(Restrictions.between("entryTime", startTime, stopTime));
            pomEntries = CTHibernateUtil.executeCriteriaQuery(c, log);
            if (pomEntries != null && pomEntries.size() > 0)
            {
                for (CTPomHistoricalTrackingEntry pe: pomEntries)
                {
                    if (!pomMap.containsKey(pe.getName()))
                    {
                        List<CTPomHistoricalTrackingEntry> peList = new ArrayList();
                        peList.add(pe);
                        pomMap.put(pe.getName(), peList);
                    }
                    else
                    {
                       pomMap.get(pe.getName()).add(pe);
                    }

                }
            }
        }
        catch (Exception e)
        {
            log.logException("Exception in getHistoricalPomEntries: ",e);
        }
        return pomMap;
    }

    private String getGenStatus(int genStatus){
         switch (genStatus){
             case CTOutageMgrConstants.NO_GENERATOR:
                 return NmsUtil.GetString("pom_constants_calculationNotAvailable");
             case CTOutageMgrConstants.GENERATOR_ONSITE:
                 return NmsUtil.GetString("pom_constants_genOnsite");
             case CTOutageMgrConstants.GENERATOR_RUNNING:
                 return NmsUtil.GetString("pom_constants_genStatusRunning");
             case CTOutageMgrConstants.GENERATOR_STOPPED:
                 return NmsUtil.GetString("pom_constants_genStatusStopped");
             case CTOutageMgrConstants.GENERATOR_REMOVED:
                 return NmsUtil.GetString("pom_constants_genStatusRemoved");
             case CTOutageMgrConstants.POWER_RESTORED:
                 return NmsUtil.GetString("pom_constants_genStatusPowerRestored");
             default:
                 return NmsUtil.GetString("pom_constants_unknown");
         }
    }
}
