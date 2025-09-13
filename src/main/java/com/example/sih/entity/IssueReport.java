package com.example.sih.entity;

import com.example.sih.types.IssueCategory;
import com.example.sih.types.Status;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class IssueReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @NonNull
    @NotNull(message = "Cant be null")
    @Column(nullable=false)
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    @NotNull
    @Column(nullable = false)
    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90.0")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90.0")
    private Double latitude;
    @NotNull
    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180.0")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180.0")
    @Column(nullable = false)
    private Double longitude;
    @Size(max = 255, message = "Photo URL too long")
    private String photoUrl;
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    @Enumerated(EnumType.STRING)
    private Status status;
    @NotNull
    @Column(nullable=false)
    @NotNull(message = "Category can't be blank")
    @Enumerated(EnumType.STRING)
    private IssueCategory category;
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    @ManyToOne(optional = false)
    @JoinColumn(name = "city_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_issue_city"))
    private City city;

    @ManyToOne(optional = false)
    @JoinColumn(name = "locality_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_issue_locality"))
    private Locality locality;
    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = Status.SUBMITTED;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
