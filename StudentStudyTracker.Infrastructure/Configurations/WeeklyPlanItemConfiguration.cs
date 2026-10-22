using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentStudyTracker.Domain.Entities;
namespace StudentStudyTracker.Infrastructure.Configurations
{

    public class WeeklyPlanItemConfiguration
        : IEntityTypeConfiguration<WeeklyPlanItem>
    {
        public void Configure(EntityTypeBuilder<WeeklyPlanItem> builder)
        {
            builder.Property(x => x.Type)
                .HasConversion<string>();

            builder.HasIndex(x => new
            {
                x.WeeklyPlanId,
                x.LessonId,
                x.Type
            }).IsUnique();

            builder.HasOne(x => x.Lesson)
                .WithMany()
                .HasForeignKey(x => x.LessonId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
