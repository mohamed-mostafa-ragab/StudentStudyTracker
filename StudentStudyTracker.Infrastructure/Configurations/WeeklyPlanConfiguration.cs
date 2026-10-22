using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentStudyTracker.Domain.Entities;
using StudentStudyTracker.Infrastructure.Identity;

namespace StudentStudyTracker.Infrastructure.Configurations
{
    
    public class WeeklyPlanConfiguration
        : IEntityTypeConfiguration<WeeklyPlan>
    {
        public void Configure(EntityTypeBuilder<WeeklyPlan> builder)
        {
            builder.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new
            {
                x.StudentId,
                x.WeekStartDate
            }).IsUnique();

            builder.HasMany(x => x.Items)
                .WithOne(x => x.WeeklyPlan)
                .HasForeignKey(x => x.WeeklyPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
