package org.example.analytics;

import com.fasterxml.jackson.databind.JsonNode;
import org.example.training.SportType;
import org.example.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

/**
 * Client for the analytics engine (Python/FastAPI), which owns the training-load
 * models (TRIMP and session-RPE). The backend delegates all load estimation here.
 */
@Component
public class AnalyticsClient {

    private final RestClient restClient;

    public AnalyticsClient(@Value("${loadpace.analytics.base-url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public record LoadEstimate(double loadAu, String method) {
    }

    private record LoadRequest(
            String type,
            Integer durationMin,
            Integer rpe,
            Integer avgHr,
            Integer restingHr,
            Integer maxHr) {
    }

    public LoadEstimate estimate(SportType type, Integer durationMin, Integer rpe, Integer avgHr, User user) {
        LoadRequest body = new LoadRequest(
                type.name(), durationMin, rpe, avgHr, user.getRestingHr(), user.getMaxHr());
        try {
            JsonNode response = restClient.post()
                    .uri("/calculate")
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null) {
                throw new AnalyticsUnavailableException();
            }
            return new LoadEstimate(response.get("loadAu").asDouble(), response.get("method").asText());
        } catch (HttpClientErrorException.UnprocessableEntity ex) {
            // The engine could not estimate the load with the inputs provided.
            throw new IllegalArgumentException(extractDetail(ex));
        } catch (ResourceAccessException ex) {
            throw new AnalyticsUnavailableException();
        }
    }

    private String extractDetail(HttpClientErrorException ex) {
        try {
            JsonNode body = ex.getResponseBodyAs(JsonNode.class);
            if (body != null && body.hasNonNull("detail")) {
                JsonNode detail = body.get("detail");
                return detail.isTextual() ? detail.asText() : detail.toString();
            }
        } catch (Exception ignored) {
            // fall through to default message
        }
        return "Could not estimate training load for the given inputs";
    }

    public static class AnalyticsUnavailableException extends RuntimeException {
        public AnalyticsUnavailableException() {
            super("Analytics engine is unavailable");
        }
    }
}
