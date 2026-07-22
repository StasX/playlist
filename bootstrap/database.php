<?php
use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule();

$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => getenv('DB_HOST') ?: 'localhost',
    'port'      => ((int) getenv('DB_PORT') ?: 3306),
    'database'  => getenv('DB_DATABASE') ?: 'playlist',
    'username'  => getenv('DB_USERNAME') ?: 'root',
    'password'  => getenv('DB_PASSWORD'),
    'charset'   => getenv('DB_CHARSET'),
    'collation' => getenv('DB_COLLATION'),
    'prefix'    => '',
]);
// Makes Capsule available globally via static methods:
$capsule->setAsGlobal();

// Boots Eloquent ORM:
$capsule->bootEloquent();

return $capsule;
