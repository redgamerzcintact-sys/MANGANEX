package com.manganex.geology.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "manganex_prospects")
public class ProspectEntity {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private Double prospectivityScore;
    private Double confidenceLower;
    private Double confidenceUpper;
    private Double estimatedTonnageMt;
    private String unfcCode;
    private String hostRock;
    private String primaryMineral;
    private Double estimatedGradeMn;
    private Double structuralScore;
    private Double satelliteScore;
    private Double boreholeScore;
    private Double geochemicalScore;
    private String explorationReadiness;
    private LocalDateTime predictedAt = LocalDateTime.now();

    public ProspectEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getProspectivityScore() { return prospectivityScore; }
    public void setProspectivityScore(Double prospectivityScore) { this.prospectivityScore = prospectivityScore; }
    public Double getConfidenceLower() { return confidenceLower; }
    public void setConfidenceLower(Double confidenceLower) { this.confidenceLower = confidenceLower; }
    public Double getConfidenceUpper() { return confidenceUpper; }
    public void setConfidenceUpper(Double confidenceUpper) { this.confidenceUpper = confidenceUpper; }
    public Double getEstimatedTonnageMt() { return estimatedTonnageMt; }
    public void setEstimatedTonnageMt(Double estimatedTonnageMt) { this.estimatedTonnageMt = estimatedTonnageMt; }
    public String getUnfcCode() { return unfcCode; }
    public void setUnfcCode(String unfcCode) { this.unfcCode = unfcCode; }
    public String getHostRock() { return hostRock; }
    public void setHostRock(String hostRock) { this.hostRock = hostRock; }
    public String getPrimaryMineral() { return primaryMineral; }
    public void setPrimaryMineral(String primaryMineral) { this.primaryMineral = primaryMineral; }
    public Double getEstimatedGradeMn() { return estimatedGradeMn; }
    public void setEstimatedGradeMn(Double estimatedGradeMn) { this.estimatedGradeMn = estimatedGradeMn; }
    public Double getStructuralScore() { return structuralScore; }
    public void setStructuralScore(Double structuralScore) { this.structuralScore = structuralScore; }
    public Double getSatelliteScore() { return satelliteScore; }
    public void setSatelliteScore(Double satelliteScore) { this.satelliteScore = satelliteScore; }
    public Double getBoreholeScore() { return boreholeScore; }
    public void setBoreholeScore(Double boreholeScore) { this.boreholeScore = boreholeScore; }
    public Double getGeochemicalScore() { return geochemicalScore; }
    public void setGeochemicalScore(Double geochemicalScore) { this.geochemicalScore = geochemicalScore; }
    public String getExplorationReadiness() { return explorationReadiness; }
    public void setExplorationReadiness(String explorationReadiness) { this.explorationReadiness = explorationReadiness; }
    public LocalDateTime getPredictedAt() { return predictedAt; }
    public void setPredictedAt(LocalDateTime predictedAt) { this.predictedAt = predictedAt; }
}

