<!doctype html>
<?php include 'key-gen.php' ?>

<head>

   <!-- player skin -->
   <link rel="stylesheet" type="text/css" href="skin/functional.css">

   <!-- site specific styling -->
   <style type="text/css">
   body { font: 12px "Myriad Pro", "Lucida Grande", sans-serif; text-align: center; padding-top: 5%; }
   </style>

   <!-- for video tag based installs flowplayer depends on jQuery 1.7.2+ -->
   <script src="//code.jquery.com/jquery-1.11.2.min.js"></script>

   <!-- include flowplayer -->
   <script type="text/javascript" src="flowplayer.min.js"></script>

</head>

<body>

   <div class="flowplayer" data-swf="flowplayer.swf" data-key="<?php generate_key(); ?>" data-ratio="0.4167">
      <video>
         <source type="video/webm" src="//stream.flowplayer.org/bauhaus.webm">
         <source type="video/mp4"  src="//stream.flowplayer.org/bauhaus.mp4">
      </video>
   </div>

   <p>PHP-generated key for <?php echo $_SERVER['SERVER_NAME']; ?>: <?php generate_key(); ?></p>

</body>
