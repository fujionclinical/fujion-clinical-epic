package org.fujionclinical.epic.common.servlet;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Intercepts requests for Epic services.
 */
public class EpicServletFilter implements Filter {

    private static final Log log = LogFactory.getLog(EpicServletFilter.class);

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void doFilter(
            ServletRequest servletRequest,
            ServletResponse servletResponse,
            FilterChain filterChain) {
        HttpServletRequest httpRequest = (HttpServletRequest) servletRequest;
        HttpServletResponse httpResponse = (HttpServletResponse) servletResponse;
        String path = httpRequest.getPathInfo();
        log.debug("Epic service request for " + path);
        IMockEpicService service = path == null ? null : MockEpicServiceRegistry.getInstance().get(path.substring(6));

        if (path != null) {
            service.invoke(httpRequest, httpResponse);
        } else {
            httpResponse.setStatus(404);
        }
    }

}
