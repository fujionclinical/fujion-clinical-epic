package org.fujionclinical.epic.common.servlet;

import org.fujionclinical.api.spring.BeanRegistry;

public class MockEpicServiceRegistry extends BeanRegistry<String, IMockEpicService> {

    private static final MockEpicServiceRegistry instance = new MockEpicServiceRegistry();

    public static MockEpicServiceRegistry getInstance()  {
        return instance;
    }

    private MockEpicServiceRegistry() {
        super(IMockEpicService.class);
    }

    @Override
    protected String getKey(IMockEpicService service) {
        return service.path();
    }
}
