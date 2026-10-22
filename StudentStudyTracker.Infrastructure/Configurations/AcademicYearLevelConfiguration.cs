using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentStudyTracker.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Infrastructure.Configurations
{
    public class AcademicYearLevelConfiguration : IEntityTypeConfiguration<AcademicYearLevel>
    {
        public void Configure(EntityTypeBuilder<AcademicYearLevel> builder)
        {
            builder.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);
            
        }
    }
}
