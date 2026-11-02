<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $image
 * @property string $songs
 */
class PlaylistModel extends Model
{
    protected $table = 'playlists';
    protected $fillable = ['id', 'name', 'image','songs'];

    public $timestamps = false;
}
