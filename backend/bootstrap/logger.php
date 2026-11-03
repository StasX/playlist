<?php

use Monolog\Handler\StreamHandler;
use Monolog\Level;
use Monolog\Logger;

$logger = new Logger('app');
$logger->pushHandler(new StreamHandler(__DIR__ . '/../storage/logs/app.log', Level::Debug));

return $logger;
