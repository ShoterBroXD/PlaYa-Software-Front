package com.playa.repository;

import com.playa.model.CommunityUser;
import com.playa.model.CommunityUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityUserRepository extends JpaRepository<CommunityUser, CommunityUserId> {

    List<CommunityUser> findByIdIdCommunity(Long idCommunity);

    List<CommunityUser> findByIdIdUser(Long idUser);

    boolean existsByIdIdCommunityAndIdIdUser(Long idCommunity, Long idUser);

    @Query("SELECT cu FROM CommunityUser cu WHERE cu.id.idCommunity = :idCommunity ORDER BY cu.joinDate ASC")
    List<CommunityUser> findByCommunityIdOrderByJoinDateAsc(@Param("idCommunity") Long idCommunity);

    @Query("SELECT cu FROM CommunityUser cu WHERE cu.id.idUser = :idUser ORDER BY cu.joinDate DESC")
    List<CommunityUser> findByUserIdOrderByJoinDateDesc(@Param("idUser") Long idUser);

    void deleteByIdIdCommunityAndIdIdUser(Long idCommunity, Long idUser);
}
