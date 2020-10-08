/*
 * #%L
 * Fujion Clinical Framework
 * %%
 * Copyright (C) 2020 fujionclinical.org
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This Source Code Form is also subject to the terms of the Health-Related
 * Additional Disclaimer of Warranty and Limitation of Liability available at
 *
 *      http://www.fujionclinical.org/licensing/disclaimer
 *
 * #L%
 */
package org.fujionclinical.epic.service;

import org.apache.commons.lang3.StringUtils;
import org.fujion.common.Logger;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Controller for a mock Epic services.
 */
@Controller
public class MockEpicServer {

    private static final Logger log = Logger.create(MockEpicServer.class);

    @RequestMapping(
            path = "/api/**",
            produces = MediaType.ALL_VALUE)
    @ResponseBody
    public void api(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) throws IOException {
        String path = StringUtils.substringAfter(httpRequest.getPathInfo(), "/api/");
        log.debug(() -> "Epic service request for " + path);
        IMockEpicService service = MockEpicServiceRegistry.getInstance().get(path);

        if (service != null) {
            service.invoke(httpRequest, httpResponse);
        } else {
            httpResponse.setStatus(404);
            PrintWriter writer = httpResponse.getWriter();
            writer.println("Unrecognized service path: " + path);
            writer.close();
        }
    }

}
