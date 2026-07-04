<?php

use Monolog\Logger;
use Monolog\Level;
use Monolog\Handler\StreamHandler;

$logger = new Logger('app');
$logger->pushHandler(new StreamHandler(__DIR__ . '/../logs/app.log', Level::Debug));
