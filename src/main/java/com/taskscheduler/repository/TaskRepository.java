package com.taskscheduler.repository;

import com.taskscheduler.entity.Task;
import com.taskscheduler.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Task Repository demonstrating JpaRepository with custom derived queries and JPQL.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserOrderByDeadlineAsc(User user);

    List<Task> findByUserIdOrderByDeadlineAsc(Long userId);

    List<Task> findByUserIdAndCompleted(Long userId, Boolean completed);

    List<Task> findByUserIdAndCategory(Long userId, String category);

    List<Task> findByUserIdAndPriority(Long userId, Task.Priority priority);

    @Query("SELECT t FROM Task t WHERE t.deadline < :now AND t.completed = false")
    List<Task> findOverdueTasks(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.completed = true")
    long countCompletedByUserId(@Param("userId") Long userId);
}
