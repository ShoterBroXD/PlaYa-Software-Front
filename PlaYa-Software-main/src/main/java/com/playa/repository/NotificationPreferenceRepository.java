package com.playa.repository;

import com.playa.model.NotificationPreference;
import com.playa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    NotificationPreference findByUser(User user);
}
