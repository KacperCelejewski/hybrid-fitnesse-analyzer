package org.example.training;

/**
 * Discipline of a training session. Determines which load model is applied:
 * heart-rate based disciplines use TRIMP, strength uses session-RPE.
 */
public enum SportType {
    RUN,
    CYCLE,
    STRENGTH
}
