package com.manganex.geology.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "manganex_mines")
public class MineEntity {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private Double elevationM;
    private String operationalStatus;
    private String mineType;
    private Integer productionRateTpd;
    private Integer plannedMonthlyTargetTonnes;
    private Integer actualMonthlyProductionTonnes;
    private Double forecastVariancePercent;
    private Double oreGradeMnPercent;
    private Double reservesMt;
    private String reserveCategory;
    private Integer geologicalConfidence;
    private Integer activeEquipmentUnits;
    private Integer totalEquipmentUnits;
    private Double monthlyRainfallMm;
    private Double groundwaterInflowRateM3h;
    private Double activeSumpCapacityPercent;
    private Double highWallDisplacementMm;
    private Double geologicalContinuityScore;
    private Double structuralComplexityIndex;
    private String lastInspectionDate;
    private LocalDateTime updatedAt = LocalDateTime.now();

    public MineEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getElevationM() { return elevationM; }
    public void setElevationM(Double elevationM) { this.elevationM = elevationM; }
    public String getOperationalStatus() { return operationalStatus; }
    public void setOperationalStatus(String operationalStatus) { this.operationalStatus = operationalStatus; }
    public String getMineType() { return mineType; }
    public void setMineType(String mineType) { this.mineType = mineType; }
    public Integer getProductionRateTpd() { return productionRateTpd; }
    public void setProductionRateTpd(Integer productionRateTpd) { this.productionRateTpd = productionRateTpd; }
    public Integer getPlannedMonthlyTargetTonnes() { return plannedMonthlyTargetTonnes; }
    public void setPlannedMonthlyTargetTonnes(Integer plannedMonthlyTargetTonnes) { this.plannedMonthlyTargetTonnes = plannedMonthlyTargetTonnes; }
    public Integer getActualMonthlyProductionTonnes() { return actualMonthlyProductionTonnes; }
    public void setActualMonthlyProductionTonnes(Integer actualMonthlyProductionTonnes) { this.actualMonthlyProductionTonnes = actualMonthlyProductionTonnes; }
    public Double getForecastVariancePercent() { return forecastVariancePercent; }
    public void setForecastVariancePercent(Double forecastVariancePercent) { this.forecastVariancePercent = forecastVariancePercent; }
    public Double getOreGradeMnPercent() { return oreGradeMnPercent; }
    public void setOreGradeMnPercent(Double oreGradeMnPercent) { this.oreGradeMnPercent = oreGradeMnPercent; }
    public Double getReservesMt() { return reservesMt; }
    public void setReservesMt(Double reservesMt) { this.reservesMt = reservesMt; }
    public String getReserveCategory() { return reserveCategory; }
    public void setReserveCategory(String reserveCategory) { this.reserveCategory = reserveCategory; }
    public Integer getGeologicalConfidence() { return geologicalConfidence; }
    public void setGeologicalConfidence(Integer geologicalConfidence) { this.geologicalConfidence = geologicalConfidence; }
    public Integer getActiveEquipmentUnits() { return activeEquipmentUnits; }
    public void setActiveEquipmentUnits(Integer activeEquipmentUnits) { this.activeEquipmentUnits = activeEquipmentUnits; }
    public Integer getTotalEquipmentUnits() { return totalEquipmentUnits; }
    public void setTotalEquipmentUnits(Integer totalEquipmentUnits) { this.totalEquipmentUnits = totalEquipmentUnits; }
    public Double getMonthlyRainfallMm() { return monthlyRainfallMm; }
    public void setMonthlyRainfallMm(Double monthlyRainfallMm) { this.monthlyRainfallMm = monthlyRainfallMm; }
    public Double getGroundwaterInflowRateM3h() { return groundwaterInflowRateM3h; }
    public void setGroundwaterInflowRateM3h(Double groundwaterInflowRateM3h) { this.groundwaterInflowRateM3h = groundwaterInflowRateM3h; }
    public Double getActiveSumpCapacityPercent() { return activeSumpCapacityPercent; }
    public void setActiveSumpCapacityPercent(Double activeSumpCapacityPercent) { this.activeSumpCapacityPercent = activeSumpCapacityPercent; }
    public Double getHighWallDisplacementMm() { return highWallDisplacementMm; }
    public void setHighWallDisplacementMm(Double highWallDisplacementMm) { this.highWallDisplacementMm = highWallDisplacementMm; }
    public Double getGeologicalContinuityScore() { return geologicalContinuityScore; }
    public void setGeologicalContinuityScore(Double geologicalContinuityScore) { this.geologicalContinuityScore = geologicalContinuityScore; }
    public Double getStructuralComplexityIndex() { return structuralComplexityIndex; }
    public void setStructuralComplexityIndex(Double structuralComplexityIndex) { this.structuralComplexityIndex = structuralComplexityIndex; }
    public String getLastInspectionDate() { return lastInspectionDate; }
    public void setLastInspectionDate(String lastInspectionDate) { this.lastInspectionDate = lastInspectionDate; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

