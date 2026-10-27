package org.example.training;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.analytics.AnalyticsClient;
import org.example.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TrainingSessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AnalyticsClient analyticsClient;

    @BeforeEach
    void stubAnalytics() {
        when(analyticsClient.estimate(any(), any(), any(), any(), any(User.class)))
                .thenReturn(new AnalyticsClient.LoadEstimate(420.0, null));
    }

    private String registerAndGetToken(String email) throws Exception {
        String body = """
                {"email":"%s","password":"strongpass1","displayName":"Tester"}
                """.formatted(email);
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(response);
        return node.get("token").asText();
    }

    @Test
    void createSessionPersistsLoadFromAnalyticsEngine() throws Exception {
        String token = registerAndGetToken("strength@loadpace.dev");
        String session = """
                {"date":"2026-06-10","type":"STRENGTH","durationMin":60,"rpe":7,"sets":18}
                """;

        mockMvc.perform(post("/api/sessions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(session))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.loadAu").value(420.0))
                .andExpect(jsonPath("$.trimp").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    void runWithHeartRatePersistsTrimp() throws Exception {
        when(analyticsClient.estimate(any(), any(), any(), any(), any(User.class)))
                .thenReturn(new AnalyticsClient.LoadEstimate(300.0, 100.4));

        String token = registerAndGetToken("runner@loadpace.dev");
        mockMvc.perform(post("/api/sessions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"date":"2026-06-10","type":"RUN","durationMin":60,"rpe":5,"avgHr":150}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.loadAu").value(300.0))
                .andExpect(jsonPath("$.trimp").value(100.4));
    }

    @Test
    void missingRpeIsBadRequest() throws Exception {
        String token = registerAndGetToken("norpe@loadpace.dev");
        mockMvc.perform(post("/api/sessions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"date":"2026-06-10","type":"RUN","durationMin":40,"avgHr":150}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rpeOutOfRangeIsBadRequest() throws Exception {
        String token = registerAndGetToken("badrpe@loadpace.dev");
        for (int rpe : new int[] {0, 11}) {
            mockMvc.perform(post("/api/sessions")
                            .header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"date":"2026-06-10","type":"RUN","durationMin":40,"rpe":%d}
                                    """.formatted(rpe)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void listReturnsOnlyOwnSessions() throws Exception {
        String tokenA = registerAndGetToken("ownerA@loadpace.dev");
        String tokenB = registerAndGetToken("ownerB@loadpace.dev");

        mockMvc.perform(post("/api/sessions")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"date":"2026-06-10","type":"STRENGTH","durationMin":45,"rpe":6}
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/sessions")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/sessions")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void deleteRemovesSession() throws Exception {
        String token = registerAndGetToken("deleter@loadpace.dev");
        String created = mockMvc.perform(post("/api/sessions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"date":"2026-06-10","type":"RUN","durationMin":30,"rpe":5}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(created).get("id").asLong();

        mockMvc.perform(delete("/api/sessions/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/sessions/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void createRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"date":"2026-06-10","type":"STRENGTH","durationMin":60,"rpe":7}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unestimatableInputsAreBadRequest() throws Exception {
        // The analytics engine rejects inputs it cannot score; the backend maps that to 400.
        when(analyticsClient.estimate(any(), any(), any(), any(), any(User.class)))
                .thenThrow(new IllegalArgumentException("Provide RPE or heart-rate data"));

        String token = registerAndGetToken("noload@loadpace.dev");
        mockMvc.perform(post("/api/sessions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"date":"2026-06-10","type":"RUN","durationMin":40,"rpe":5}
                                """))
                .andExpect(status().isBadRequest());
    }
}
