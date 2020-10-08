package org.fujionclinical.epic.healthmaintenance;

import org.fujionclinical.epic.service.IMockEpicService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class HealthMaintenanceService implements IMockEpicService {

    @Override
    public String path() {
        return "rest/RefreshHealthMaintenance";
    }

    @Override
    public void invoke(
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        try {
            PrintWriter writer = servletResponse.getWriter();
            writer.println("{\"success\": true}");
            writer.close();
        } catch (IOException e) {
            // NOP
        }
    }

}
