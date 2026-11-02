<?php

use DI\Container;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/database.php';

AppFactory::setContainer(new Container());
$app = AppFactory::create();
$app->addRoutingMiddleware();

/** @var \Monolog\Logger $logger */
$logger = require __DIR__ . '/logger.php';
$app->addErrorMiddleware(true, true, true, $logger);

require __DIR__ . '/../config/routes.php';

return $app;
