using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentStudyTracker.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Infrastructure.Configurations
{
    public class ChapterConfiguration : IEntityTypeConfiguration<Chapter>
    {
        public void Configure(EntityTypeBuilder<Chapter> builder)
        {
            builder.Property(c=>c.Title)
                .IsRequired()
                .HasMaxLength(200);
            builder.HasOne(c=>c.Subject)
                .WithMany(c=>c.Chapters)
                .HasForeignKey(c=>c.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}
