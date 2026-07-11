<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayListModel extends Model
{
    protected $table = 'playlists';
    protected $fillable = ['id', 'name', 'image','songs'];

    public $timestamps = false;
}
