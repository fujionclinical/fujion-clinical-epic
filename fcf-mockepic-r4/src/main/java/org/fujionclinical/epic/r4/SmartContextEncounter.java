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
package org.fujionclinical.epic.r4;

import org.fujionclinical.epic.common.core.Constants;
import org.fujionclinical.epic.common.smart.SmartContextEncounterBase;
import org.fujionclinical.fhir.r4.api.common.FhirUtil;
import org.fujionclinical.fhir.r4.api.encounter.EncounterContext;
import org.hl7.fhir.r4.model.Encounter;
import org.hl7.fhir.r4.model.Identifier;

/**
 * Implements SMART context scope to supply CSN in SMART context.
 */
public class SmartContextEncounter extends SmartContextEncounterBase {

    /**
     * Populate context map with information about currently selected encounter.
     *
     * @param context Context map to be populated.
     */
    @Override
    protected void updateContext(ContextMap context) {
        Encounter encounter = EncounterContext.getActiveEncounter();
        Identifier id = encounter == null ? null : FhirUtil.getIdentifierBySystem(encounter.getIdentifier(), Constants.CSN_SYSTEM);

        if (id != null) {
            context.put("csn", id.getValue());
        }
    }

}
