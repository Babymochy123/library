from django.db import models
from django.contrib.auth.models import User
from datetime import timedelta, date

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=13, unique=True)
    available_copies = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.title} by {self.author}"

class BorrowRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    issue_date = models.DateField(auto_now_add=True)
    return_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(default=date.today() + timedelta(days=14))
    fine = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

    def calculate_fine(self):
        if self.return_date and self.return_date > self.due_date:
            days_late = (self.return_date - self.due_date).days
            self.fine = days_late * 1.00  # fine rate per day
        else:
            self.fine = 0.00
        return self.fine
