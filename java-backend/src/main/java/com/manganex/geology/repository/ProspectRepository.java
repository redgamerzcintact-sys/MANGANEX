package com.manganex.geology.repository;

import com.manganex.geology.entity.ProspectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProspectRepository extends JpaRepository<ProspectEntity, String> {
}

