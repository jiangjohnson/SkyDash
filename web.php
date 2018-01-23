<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('skydash');
});

Route::get('/channelgroup','dbcontroller@GetChannelGroups');

Route::get('/periodrange','dbcontroller@GetPeriodRanges');

Route::get('/channelperformance','dbcontroller@GetChannelPerformance');

Route::get('/programmeperformance','dbcontroller@GetProgramePerformance');

Route::get('/trending','dbcontroller@GetTrending');

Route::get('/filtertitle','dbcontroller@BMITitles');