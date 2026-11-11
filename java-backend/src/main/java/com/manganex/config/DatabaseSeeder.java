package com.manganex.config;

import com.manganex.geology.entity.MineEntity;
import com.manganex.geology.entity.ProspectEntity;
import com.manganex.geology.repository.MineRepository;
import com.manganex.geology.repository.ProspectRepository;
import com.manganex.users.entity.Role;
import com.manganex.users.entity.User;
import com.manganex.users.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatabaseSeeder {

    @Bean
    public CommandLineRunner seedDatabase(UserRepository userRepository,
                                         MineRepository mineRepository,
                                         ProspectRepository prospectRepository,
                                         PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Seed Role-specific Users for the login portals (Always upsert demo accounts)
            userRepository.save(new User("usr-admin", "admin", "admin@moil.gov.in",
                    passwordEncoder.encode("ManganexAdmin2026!"), "Director General of Mining Operations",
                    Role.ROLE_ADMIN, "Ministry of Steel / MOIL"));

            userRepository.save(new User("usr-geologist", "geologist", "geologist@moil.gov.in",
                    passwordEncoder.encode("ManganexGeo2026!"), "Chief Exploration Geologist",
                    Role.ROLE_GEOLOGIST, "GSI / MOIL Exploration Wing"));

            userRepository.save(new User("usr-engineer", "engineer", "engineer@moil.gov.in",
                    passwordEncoder.encode("ManganexEng2026!"), "Principal Mine Planning Engineer",
                    Role.ROLE_ENGINEER, "Balaghat Underground Operations"));

            userRepository.save(new User("usr-analyst", "analyst", "analyst@moil.gov.in",
                    passwordEncoder.encode("ManganexData2026!"), "Senior Geospatial Data Analyst",
                    Role.ROLE_ANALYST, "National Mineral Intelligence Unit"));

            userRepository.save(new User("usr-viewer", "viewer", "viewer@moil.gov.in",
                    passwordEncoder.encode("ManganexViewer2026!"), "Executive Observer",
                    Role.ROLE_VIEWER, "Public Mineral Observatory"));

            // 2. Seed MOIL Mines Cadastre
            if (mineRepository.count() == 0) {
                MineEntity balaghat = new MineEntity();
                balaghat.setId("mine-balaghat");
                balaghat.setName("Balaghat Mine (Bharweli)");
                balaghat.setCode("MOIL-BG-01");
                balaghat.setDistrict("Balaghat");
                balaghat.setState("Madhya Pradesh");
                balaghat.setLatitude(21.8049);
                balaghat.setLongitude(80.2033);
                balaghat.setElevationM(345.0);
                balaghat.setOperationalStatus("critical");
                balaghat.setMineType("Underground");
                balaghat.setProductionRateTpd(1450);
                balaghat.setPlannedMonthlyTargetTonnes(45000);
                balaghat.setActualMonthlyProductionTonnes(36200);
                balaghat.setForecastVariancePercent(-19.5);
                balaghat.setOreGradeMnPercent(43.8);
                balaghat.setReservesMt(18.4);
                balaghat.setReserveCategory("Proven (UNFC 111)");
                balaghat.setGeologicalConfidence(94);
                balaghat.setActiveEquipmentUnits(28);
                balaghat.setTotalEquipmentUnits(36);
                balaghat.setMonthlyRainfallMm(124.5);
                balaghat.setGroundwaterInflowRateM3h(280.0);
                balaghat.setActiveSumpCapacityPercent(88.0);
                balaghat.setHighWallDisplacementMm(14.2);
                balaghat.setGeologicalContinuityScore(91.2);
                balaghat.setStructuralComplexityIndex(74.0);
                balaghat.setLastInspectionDate("2026-10-28");
                mineRepository.save(balaghat);

                MineEntity tirodi = new MineEntity();
                tirodi.setId("mine-tirodi");
                tirodi.setName("Tirodi Mine");
                tirodi.setCode("MOIL-TR-02");
                tirodi.setDistrict("Balaghat");
                tirodi.setState("Madhya Pradesh");
                tirodi.setLatitude(21.6883);
                tirodi.setLongitude(79.7117);
                tirodi.setElevationM(312.0);
                tirodi.setOperationalStatus("warning");
                tirodi.setMineType("Open Cast");
                tirodi.setProductionRateTpd(980);
                tirodi.setPlannedMonthlyTargetTonnes(30000);
                tirodi.setActualMonthlyProductionTonnes(25400);
                tirodi.setForecastVariancePercent(-15.3);
                tirodi.setOreGradeMnPercent(38.5);
                tirodi.setReservesMt(12.1);
                tirodi.setReserveCategory("Probable (UNFC 122)");
                tirodi.setGeologicalConfidence(88);
                tirodi.setActiveEquipmentUnits(19);
                tirodi.setTotalEquipmentUnits(24);
                tirodi.setMonthlyRainfallMm(110.0);
                tirodi.setGroundwaterInflowRateM3h(195.0);
                tirodi.setActiveSumpCapacityPercent(72.0);
                tirodi.setHighWallDisplacementMm(9.4);
                tirodi.setGeologicalContinuityScore(86.5);
                tirodi.setStructuralComplexityIndex(68.0);
                tirodi.setLastInspectionDate("2026-10-25");
                mineRepository.save(tirodi);

                MineEntity dongri = new MineEntity();
                dongri.setId("mine-dongri");
                dongri.setName("Dongri Buzurg Mine");
                dongri.setCode("MOIL-DB-03");
                dongri.setDistrict("Bhandara");
                dongri.setState("Maharashtra");
                dongri.setLatitude(21.5485);
                dongri.setLongitude(79.6975);
                dongri.setElevationM(295.0);
                dongri.setOperationalStatus("optimal");
                dongri.setMineType("Open Cast");
                dongri.setProductionRateTpd(1200);
                dongri.setPlannedMonthlyTargetTonnes(38000);
                dongri.setActualMonthlyProductionTonnes(39100);
                dongri.setForecastVariancePercent(2.9);
                dongri.setOreGradeMnPercent(41.2);
                dongri.setReservesMt(14.6);
                dongri.setReserveCategory("Proven (UNFC 111)");
                dongri.setGeologicalConfidence(92);
                dongri.setActiveEquipmentUnits(26);
                dongri.setTotalEquipmentUnits(28);
                dongri.setMonthlyRainfallMm(95.0);
                dongri.setGroundwaterInflowRateM3h(140.0);
                dongri.setActiveSumpCapacityPercent(54.0);
                dongri.setHighWallDisplacementMm(4.1);
                dongri.setGeologicalContinuityScore(89.0);
                dongri.setStructuralComplexityIndex(58.0);
                dongri.setLastInspectionDate("2026-10-29");
                mineRepository.save(dongri);
            }

            // 3. Seed AI Geological Prospects
            if (prospectRepository.count() == 0) {
                ProspectEntity p1 = new ProspectEntity();
                p1.setId("prospect-ukwa-ext");
                p1.setName("Ukwa North Syncline Extension");
                p1.setDistrict("Balaghat");
                p1.setState("Madhya Pradesh");
                p1.setLatitude(21.9680);
                p1.setLongitude(80.4850);
                p1.setProspectivityScore(91.4);
                p1.setConfidenceLower(86.2);
                p1.setConfidenceUpper(95.1);
                p1.setEstimatedTonnageMt(42.5);
                p1.setUnfcCode("UNFC-332 (Indicated Mineral Resource)");
                p1.setHostRock("Mansar Schist / Gondite Contact");
                p1.setPrimaryMineral("Braunite-Pyrolusite Massive Reef");
                p1.setEstimatedGradeMn(44.2);
                p1.setStructuralScore(94.0);
                p1.setSatelliteScore(88.0);
                p1.setBoreholeScore(79.0);
                p1.setGeochemicalScore(92.0);
                p1.setExplorationReadiness("PRIORITY_1_SCOUT_DRILL");
                prospectRepository.save(p1);

                ProspectEntity p2 = new ProspectEntity();
                p2.setId("prospect-ramrama-deep");
                p2.setName("Ramrama Deep Fault Horizon");
                p2.setDistrict("Balaghat");
                p2.setState("Madhya Pradesh");
                p2.setLatitude(21.8540);
                p2.setLongitude(79.9120);
                p2.setProspectivityScore(84.7);
                p2.setConfidenceLower(79.5);
                p2.setConfidenceUpper(89.3);
                p2.setEstimatedTonnageMt(28.4);
                p2.setUnfcCode("UNFC-333 (Inferred Mineral Resource)");
                p2.setHostRock("Chorbaoli Quartzite Overthrust");
                p2.setPrimaryMineral("Psilomelane-Cryptomelane");
                p2.setEstimatedGradeMn(39.8);
                p2.setStructuralScore(86.0);
                p2.setSatelliteScore(82.0);
                p2.setBoreholeScore(68.0);
                p2.setGeochemicalScore(84.0);
                p2.setExplorationReadiness("PRIORITY_2_SEISMIC_GRID");
                prospectRepository.save(p2);
            }
        };
    }
}

