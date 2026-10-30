package com.taskscheduler.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Role Entity representing system authorities for Role-Based Access Control (RBAC).
 * Demonstrates: JPA @Entity, @Table, @Id, @GeneratedValue, @Column
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    public enum RoleName {
        ROLE_USER,
        ROLE_ADMIN
    }
}
