package org.fujionclinical.epic.common.servlet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface IMockEpicService {

    String path();

    void invoke(HttpServletRequest servletRequest, HttpServletResponse servletResponse);

}
