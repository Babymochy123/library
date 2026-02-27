from django.test import TestCase
from django.contrib.auth.models import User

class AuthTests(TestCase):
    def setUp(self):
        User.objects.create_user(username='testuser', password='testpass')

    def test_login(self):
        response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'testpass'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.json())