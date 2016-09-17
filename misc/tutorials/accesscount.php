<!DOCTYPE html>
<html>
<head>
<title>Access Count Page</title>
</head>

<body>
<?php

$filename = "count.txt";
$contents = file_get_contents($filename) + 1;
echo "<h1>Page has been accessed $contents times</h1>";
file_put_contents($filename, $contents);

?>
</body>

</html>
