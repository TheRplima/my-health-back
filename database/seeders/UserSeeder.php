<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = new User();
        $user->create([
            'name' => 'Rodrigo Lima',
            'email' => 'rplima.dev@gmail.com',
            'password' => Hash::make('Rp!25051979'),
            'phone' => '35998094996',
            'gender' => 'M',
            'dob' => '1979-05-25',
            'height' => 168,
            'weight' => 81,
            'daily_water_amount' => 4500,
            'activity_level' => 0.725,
            'image' => 'images/users/male.jpg',
            'active' => 1
        ]);
        // User::factory(10)->create();
    }
}
