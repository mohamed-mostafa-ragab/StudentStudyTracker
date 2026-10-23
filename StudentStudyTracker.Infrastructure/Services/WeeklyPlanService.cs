using Microsoft.EntityFrameworkCore;
using StudentStudyTracker.Application.Common;
using StudentStudyTracker.Application.DTOs.Plan;
using StudentStudyTracker.Application.Exceptions;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Entities;
using StudentStudyTracker.Domain.Enums;
using StudentStudyTracker.Infrastructure.Persistence;

namespace StudentStudyTracker.Infrastructure.Services
{
    internal class WeeklyPlanService(AppDbContext db) : IWeeklyPlanService
    {
        public async Task<WeeklyPlanDto> GetWeekAsync(string studentId, DateOnly? date)
        {
            var start = WeekCalendar.StartOfWeek(date ?? AppClock.Today);

            var planId = await db.WeeklyPlans
                .AsNoTracking()
                .Where(p => p.StudentId == studentId && p.WeekStartDate == start)
                .Select(p => (int?)p.Id)
                .FirstOrDefaultAsync();

            var items = await db.WeeklyPlanItems
                .AsNoTracking()
                .Where(i => i.WeeklyPlan.StudentId == studentId && i.WeeklyPlan.WeekStartDate == start)
                .WhereLessonPublished()
                .OrderBy(i => i.DueDate).ThenBy(i => i.Type).ThenBy(i => i.Id)
                .Select(PlanProjections.ItemToDto)
                .ToListAsync();

            return new WeeklyPlanDto(planId, start, start.AddDays(6), items);
        }

        public async Task<PlanItemDto> AddItemAsync(string studentId, AddPlanItemRequest request)
        {
            var lesson = await db.Lessons
                .AsNoTracking()
                .WherePublished()
                .Where(l => l.Id == request.LessonId)
                .Select(l => new { l.Id })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Lesson not found.");

            if (request.Type == WeeklyPlanItemType.Review)
            {
                var started = await db.StudentLessonProgresses.AnyAsync(p =>
                    p.StudentId == studentId && p.LessonId == lesson.Id &&
                    (p.HasAttended || p.HasStudied || p.HasCompletedExercises));

                if (!started)
                    throw new BadRequestException("You can only review a lesson you have already started.");
            }

            var start = WeekCalendar.StartOfWeek(request.DueDate);

            var plan = await db.WeeklyPlans
                .FirstOrDefaultAsync(p => p.StudentId == studentId && p.WeekStartDate == start);

            if (plan is null)
            {
                plan = new WeeklyPlan
                {
                    StudentId = studentId,
                    WeekStartDate = start,
                    WeekEndDate = start.AddDays(6)
                };
                db.WeeklyPlans.Add(plan);
            }
            else
            {
                var duplicate = await db.WeeklyPlanItems.AnyAsync(i =>
                    i.WeeklyPlanId == plan.Id && i.LessonId == lesson.Id && i.Type == request.Type);

                if (duplicate)
                    throw new ConflictException("This lesson is already in the plan with the same type.");
            }

            var item = new WeeklyPlanItem
            {
                WeeklyPlan = plan,
                LessonId = lesson.Id,
                Type = request.Type,
                DueDate = request.DueDate,
                DurationInMinutes = request.DurationInMinutes,
                Description = request.Description?.Trim()
            };

            db.WeeklyPlanItems.Add(item);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.IsUniqueViolation())
            {
                throw new ConflictException("This plan item already exists.");
            }

            return await GetItemDtoAsync(studentId, item.Id);
        }

        public async Task<PlanItemDto> UpdateItemAsync(string studentId, int itemId, UpdatePlanItemRequest request)
        {
            var item = await FindOwnedItemAsync(studentId, itemId);

            var plan = item.WeeklyPlan;
            if (request.DueDate < plan.WeekStartDate || request.DueDate > plan.WeekEndDate)
                throw new BadRequestException("Due date must be within the plan week.");

            item.DueDate = request.DueDate;
            item.DurationInMinutes = request.DurationInMinutes;
            item.Description = request.Description?.Trim();

            await db.SaveChangesAsync();

            return await GetItemDtoAsync(studentId, itemId);
        }

        public async Task<PlanItemDto> SetCompletedAsync(string studentId, int itemId, bool completed)
        {
            var item = await FindOwnedItemAsync(studentId, itemId);

            if (completed)
                item.CompletedAt ??= DateTime.UtcNow;
            else
                item.CompletedAt = null;

            await db.SaveChangesAsync();

            return await GetItemDtoAsync(studentId, itemId);
        }

        public async Task DeleteItemAsync(string studentId, int itemId)
        {
            var item = await FindOwnedItemAsync(studentId, itemId);
            db.WeeklyPlanItems.Remove(item);
            await db.SaveChangesAsync();
        }

        private async Task<WeeklyPlanItem> FindOwnedItemAsync(string studentId, int itemId) =>
            await db.WeeklyPlanItems
                .Include(i => i.WeeklyPlan)
                .FirstOrDefaultAsync(i => i.Id == itemId && i.WeeklyPlan.StudentId == studentId)
            ?? throw new NotFoundException("Plan item not found.");

        private async Task<PlanItemDto> GetItemDtoAsync(string studentId, int itemId) =>
            await db.WeeklyPlanItems
                .AsNoTracking()
                .Where(i => i.Id == itemId && i.WeeklyPlan.StudentId == studentId)
                .Select(PlanProjections.ItemToDto)
                .FirstAsync();
    }
}