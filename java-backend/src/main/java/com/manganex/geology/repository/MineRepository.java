package com.manganex.geology.repository;

import com.manganex.geology.entity.MineEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MineRepository extends JpaRepository<MineEntity, String> {
}

