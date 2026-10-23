using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace StudentStudyTracker.Infrastructure.Persistence;

public static class DbExceptionExtensions
{
    public static bool IsUniqueViolation(this DbUpdateException ex) =>
        ex.InnerException is SqlException { Number: 2601 or 2627 };
}