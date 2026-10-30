package com.taskscheduler.repository;

import com.taskscheduler.entity.Reminder;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Reminder Repository demonstrating Spring Data CrudRepository.
 * Fulfills Module 5 requirement: "Demonstrate both JpaRepository and CrudRepository".
 */
@Repository
public interface ReminderRepository extends CrudRepository<Reminder, Long> {

    List<Reminder> findByUserIdOrderByReminderTimeAsc(Long userId);

    List<Reminder> findByTaskId(Long taskId);

    List<Reminder> findByStatusAndReminderTimeBefore(Reminder.ReminderStatus status, LocalDateTime dateTime);

    long countByUserIdAndStatus(Long userId, Reminder.ReminderStatus status);
}
