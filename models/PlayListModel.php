<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayList extends Model
{
    protected $table = 'playlists';
    protected $fillable = ['id', 'name', 'image','songs'];
}
