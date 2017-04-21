package com.tollgrade.cable.ccms.service.pomdashboard;

import java.net.InetAddress;
import java.rmi.RemoteException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.POST;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.tollgrade.cable.ccms.devicemodel.common.CTMOConst;
import com.tollgrade.cable.ccms.service.CTWebServices.*;
import com.tollgrade.cable.ccms.util.CTRMIAPIUtil;
import com.tollgrade.cable.ccms.ctlogging.CTLog4j;
import org.json.JSONArray;
import org.json.JSONObject;

@Path("/POMDashboardServices")
public class CTPOMDashboardServices {
  public static String cxdHostName;
  public static CTLog4j log = new CTLog4j("CTPOMDashboardServices");
  private String remoteHostName = "";
  private HttpSession session;
  private String userName = null;

  public CTPOMDashboardServices(@Context HttpServletRequest req) {
    cxdHostName = "localhost";
    try {
      session = req.getSession();
      String hostName = req.getSession().getServletContext().getInitParameter("CheetahXDHostName");
      userName = (String) req.getSession().getAttribute("userName");

      if (hostName != null) {
        cxdHostName = hostName;
        CTRMIAPIUtil.setRMIHostName(cxdHostName);
      }
      remoteHostName = req.getRemoteHost();

    } catch (Exception e) {
    }

    if (cxdHostName.equals("localhost")) {
      try {
        cxdHostName = InetAddress.getLocalHost().getHostName();
      } catch (Exception e) {
        log.logVerbose("CTPOMDashboardServices: exception getting local hostname: " + e.toString());
      }
    }
  }

  public CTPOMDashboardServices() {
    cxdHostName = "localhost";
    try {
      cxdHostName = InetAddress.getLocalHost().getHostName();
    } catch (Exception e) {
      log.logVerbose("CTPOMDashboardServices: exception getting local hostname: " + e.toString());

    }
    remoteHostName = cxdHostName;
  }

  @GET
  @Path("GetLastConfig")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getLastConfig() throws RemoteException, Exception {
    CTPOMDashboardUtils rt = new CTPOMDashboardUtils(CTMOConst.POM_TREE, null, null, null, log, userName);
    JSONObject responseObject = new JSONObject();
    responseObject.put("data", rt.getLastConfig());

    log.logDebug("GetLastConfig: Sending response: " + responseObject.toString());

    return Response.ok(responseObject.toString()).build();
  }

  @GET
  @Path("GetRegionsAreasHubs")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getRegionsAreasHubs() throws RemoteException, Exception {
    CTPOMDashboardUtils rt = new CTPOMDashboardUtils(CTMOConst.POM_TREE, null, null, null, log, userName);
    JSONObject responseObject = new JSONObject();
    responseObject.put("data", rt.getRegionsAreasHubs());

    log.logDebug("GetRegionsAreasHubs: Sending response: " + responseObject.toString());

    return Response.ok(responseObject.toString()).build();
  }


  @POST
  @Path("GetPOMDashboardRealtime")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getPOMDashboardRealtime(@QueryParam("region") String region,
                                          @QueryParam("area") String area,
                                          @QueryParam("hub") String hub)
    throws RemoteException, Exception {
    CTPOMDashboardUtils rt = new CTPOMDashboardUtils(CTMOConst.POM_TREE, region, area, hub, log, userName);
    JSONObject responseObject = new JSONObject();
    responseObject.put("data", rt.getPOMDashboardRealtime());
    log.logDebug("GetPOMDashboardRealtime: Sending response: " + responseObject.toString());
    return Response.ok(responseObject.toString()).build();
  }

  @POST
  @Path("GetPOMDashboardHistorical")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getPOMDashboardHistorical(@QueryParam("region") String region,
                                            @QueryParam("area") String area,
                                            @QueryParam("hub") String hub,
                                            @QueryParam("startTime") String startTime,
                                            @QueryParam("stopTime") String stopTime)
    throws RemoteException, Exception {
    CTPOMDashboardUtils rt = new CTPOMDashboardUtils(CTMOConst.POM_TREE, region, area, hub, log, userName);
    JSONObject responseObject = new JSONObject();
    responseObject.put("data", rt.getPOMDashboardHistorical(startTime, stopTime));
    log.logDebug("GetPOMDashboardHistorical: Sending response: " + responseObject.toString());
    return Response.ok(responseObject.toString()).build();
  }

  @GET
  @Path("GetPOMDrilldownDataLive")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getPOMDrilldownDataLive(@QueryParam("node") String node,
                                          @QueryParam("severity") int severity)
    throws RemoteException, Exception {
    CTPOMDashboardUtils rt = new CTPOMDashboardUtils(CTMOConst.POM_TREE, node, null, null, log, userName);
    JSONObject responseObject = new JSONObject();
    responseObject.put("data", new JSONArray(rt.getPOMDrilldownDataLive(severity)));
    log.logDebug("GetPOMDrilldownDataLive: Sending response: " + responseObject.toString());
    return Response.ok(responseObject.toString()).build();
  }

  @GET
  @Path("GetPOMDrilldownDataHistorical")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getPOMDrilldownDataHistorical(@QueryParam("node") String node,
                                                @QueryParam("startTime") String startTime,
                                                @QueryParam("stopTime") String stopTime,
                                                @QueryParam("severity") int severity)

    throws RemoteException, Exception {
    CTPOMDashboardUtils rt = new CTPOMDashboardUtils(CTMOConst.POM_TREE, node, null, null, log, userName);
    JSONObject responseObject = new JSONObject();
    responseObject.put("data", new JSONArray(rt.getPOMDrilldownDataHistorical(startTime, stopTime, severity)));
    log.logDebug("GetPOMDrilldownDataHistorical: Sending response: " + responseObject.toString());
    return Response.ok(responseObject.toString()).build();
  }
}
