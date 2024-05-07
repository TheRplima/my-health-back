<?php

namespace App\Http\Controllers;

use App\Http\Requests\GetWaterIntakeRequest;
use App\Http\Requests\StoreWaterIntakeRequest;
use Illuminate\Http\Request;
use App\Models\WaterIntake;
use Carbon\Carbon;

class WaterIntakeController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(GetWaterIntakeRequest $request)
    {
        $data = $request->validated();
        $initialDate = isset($data['initial_date']) && $data['initial_date'] ? $data['initial_date'] : null;
        $finalDate = isset($data['final_date']) && $data['final_date'] ? $data['final_date'] : null;
        $amount = isset($data['amount']) && $data['amount'] ? $data['amount'] : null;
        $page = isset($data['page']) && $data['page'] ? $data['page'] : 1;
        $perPage = isset($data['per_page']) && $data['per_page'] ? $data['per_page'] : 10;

        $qb = auth()->user()->WaterIntake()
            ->when($initialDate, function ($query) use ($initialDate) {
                return $query->whereDate('created_at', '>=', $initialDate);
            })
            ->when($finalDate, function ($query) use ($finalDate) {
                return $query->whereDate('created_at', '<=', $finalDate);
            })
            ->when($amount, function ($query) use ($amount) {
                return $query->where('amount', $amount);
            });

        $chartQb = $qb;
        $totalAmount = $qb->sum('amount');
        $waterIntakes = $qb->paginate($perPage);

        $waterIntakeChartData = [];
        $waterIntakeChartData = $chartQb->selectRaw('DATE(created_at) as date, SUM(amount) as total_amount')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    Carbon::parse($item->date)->format('d/m/Y'),
                    (float)$item->total_amount,
                    auth()->user()->daily_water_amount
                ];
            });

        $waterIntakeChartData = array_merge([["Dia", "Consumo de água", "Meta"]], $waterIntakeChartData->toArray());

        return response()->json([
            'status' => 'success',
            'total_amount' => $totalAmount,
            'water_intake_list' => $waterIntakes,
            'water_intake_chart' => $waterIntakeChartData
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWaterIntakeRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->user()->id ?? $request->user_id;
        $waterIntake = WaterIntake::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Water Intake created successfully',
            'water_intake' => $waterIntake,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $waterIntake = WaterIntake::find($id);
        $waterIntake->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Water Intake deleted successfully',
            'water_intake' => $waterIntake,
        ]);
    }

    public function getWaterIntakesByDay(GetWaterIntakeRequest $request)
    {
        $data = $request->validated();

        $date = isset($data['date']) && $data['date'] ? $data['date'] : now()->toDateString();
        $waterIntakes = auth()->user()->WaterIntake()
            ->whereDate('created_at', $date)
            ->get();

        $totalAmount = 0;
        foreach ($waterIntakes as $waterIntake) {
            $totalAmount += $waterIntake->amount;
        }

        return response()->json([
            'status' => 'success',
            'total_amount' => $totalAmount,
            'water_intake_list' => $waterIntakes,
        ]);
    }
}