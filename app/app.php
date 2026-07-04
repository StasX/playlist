<?php


use Slim\Factory\AppFactory;

$app = AppFactory::create();

$app->addRoutingMiddleware();

require __DIR__ . '/logger.php';

$errorMiddleware = $app->addErrorMiddleware(true, true, true, $logger);
