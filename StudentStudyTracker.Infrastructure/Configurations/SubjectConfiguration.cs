using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentStudyTracker.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Infrastructure.Configurations
{
    public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
    {
        public void Configure(EntityTypeBuilder<Subject> builder)
        {
            builder.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);
            builder.HasOne(e=>e.AcademicYearLevel)
                .WithMany(e=>e.Subjects)
                .HasForeignKey(e => e.AcademicYearLevelId)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}
