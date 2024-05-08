<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Ramsey\Uuid\Uuid;

class UserController extends Controller
{

    public function index(): JsonResponse
    {
        $users = User::paginate();
        return (new UserCollection($users))->response();
    }

    public function store(RegisterUserRequest $request): JsonResponse
    {

        $data = $request->validated();
        if ($request['image']) {
            $extension  = explode(':', substr($request['image'], 0, strpos($request['image'], ';')));
            $extension = explode('/', $extension[count($extension) - 1])[1];
            $format = $extension == 'jpeg' ? 'jpg' : $extension;
            $name = md5($request['name'] . Carbon::now()) . '.' . $format;
            $filePath = 'images/users/' . $name;
            $image = str_replace(' ', '+', str_replace(substr($request['image'], 0, strpos($request['image'], ',') + 1), '', $request['image']));
            Storage::disk('public')->put($filePath, base64_decode($image), 'public');
            $data['image'] = $filePath;
        }

        $user = User::create(UserResource::make($data)->toArray($request));
        unset($user['password']);
        $token = Auth::login($user);
        return response()->json([
            'status' => 'success',
            'message' => 'User created successfully',
            'user' => $user,
            'authorisation' => [
                'token' => $token,
                'type' => 'bearer',
            ]
        ], Response::HTTP_CREATED);
    }

    public function show($id = null): JsonResponse
    {
        if (!$id) {
            $user = Auth::user();
        } else {
            $user = User::findOrFail($id);
        }

        return (new UserResource($user))->response();
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();
        if ($request['image']) {
            Storage::disk('public')->delete($user->image);
            $extension  = explode(':', substr($request['image'], 0, strpos($request['image'], ';')));
            $extension = explode('/', $extension[count($extension) - 1])[1];
            $format = $extension == 'jpeg' ? 'jpg' : $extension;
            $name = md5($user->name . Carbon::now()) . '.' . $format;
            $filePath = 'images/users/' . $name;
            $image = str_replace(' ', '+', str_replace(substr($request['image'], 0, strpos($request['image'], ',') + 1), '', $request['image']));
            Storage::disk('public')->put($filePath, base64_decode($image), 'public');
            $data['image'] = $filePath;
        }
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->fill($data);
        $user->save();

        $token = Auth::login($user);
        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully',
            'user' => (new UserResource($user))->toArray($request),
            'authorisation' => [
                'token' => $token,
                'type' => 'bearer',
            ]
        ], Response::HTTP_OK);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->image) {
            Storage::disk('public')->delete($user->image);
        }
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully',
            'user' => $user,
        ]);
    }

    //fuction to generate telegram deeplink to subscribe user to receive notify via telegram
    public function generateTelegramDeeplink(User $user): JsonResponse
    {
        $user->telegram_user_deeplink = Uuid::uuid4();
        $user->save();

        $deeplink = 'https://t.me/' . config('services.telegram-bot-api.bot_name') . '?start=' . $user->telegram_user_deeplink;

        return response()->json([
            'status' => 'success',
            'message' => 'Telegram deeplink generated successfully',
            'deeplink' => $deeplink,
        ]);
    }

    public function subscribeUserToTelegramNotify(User $user): JsonResponse
    {
        $user->telegram_notify = true;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'User subscribed to telegram notifications',
            'user' => (new UserResource($user))->toArray(request()),
        ]);
    }
}
