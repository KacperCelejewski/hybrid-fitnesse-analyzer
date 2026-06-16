package org.example.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndGetToken(String email) throws Exception {
        String body = """
                {"email":"%s","password":"strongpass1","displayName":"Tester"}
                """.formatted(email);
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

    @Test
    void updateProfilePersistsPhysiologicalParameters() throws Exception {
        String token = registerAndGetToken("profile@loadpace.dev");

        mockMvc.perform(put("/api/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"age":30,"weightKg":75.0,"restingHr":60,"maxHr":190}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.restingHr").value(60))
                .andExpect(jsonPath("$.maxHr").value(190));

        mockMvc.perform(get("/api/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.age").value(30))
                .andExpect(jsonPath("$.weightKg").value(75.0));
    }

    @Test
    void maxHrNotGreaterThanRestingIsRejected() throws Exception {
        String token = registerAndGetToken("badhr@loadpace.dev");
        mockMvc.perform(put("/api/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"restingHr":150,"maxHr":140}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void profileRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isUnauthorized());
    }
}
