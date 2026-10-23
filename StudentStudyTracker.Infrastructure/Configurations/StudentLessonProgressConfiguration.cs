using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentStudyTracker.Domain.Entities;
using StudentStudyTracker.Infrastructure.Identity;

namespace StudentStudyTracker.Infrastructure.Configurations
{
    public class StudentLessonProgressConfiguration : IEntityTypeConfiguration<StudentLessonProgress>
    {
        public void Configure(EntityTypeBuilder<StudentLessonProgress> builder)
        {
            builder.HasIndex(slp => new { slp.StudentId, slp.LessonId }).IsUnique();
            builder.Property(slp=>slp.StudentId)
                .IsRequired()
                .HasMaxLength(450);
            builder.HasOne(slp => slp.Lesson)
                .WithMany(l => l.StudentLessonProgresses)
                .HasForeignKey(slp => slp.LessonId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(slp => slp.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.Ignore(slp => slp.Status);
        }
    }
}
