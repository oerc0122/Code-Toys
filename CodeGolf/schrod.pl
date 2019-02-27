$H=1;$L=0;$i=9;$V=10;$Q=1e-3;$T=1e-6;$l=4;while(abs&K>$T){$E=($H+$L)/2;&K<0?$H=$E:$L=$E}print"#$E
";$P=1;&K;sub g{($x,$d)=@_;$h=$d;$c=$p=0;for(0..abs$x/$h){$c=$d+&f($p)/2;$d+=&f($p+$d*$h/2);$p+=$c*$h;$x+=$h;print"$x $p $d
"if$P}$d/$p}sub f{(abs$x<$l?$E:$E-$V)*-$_[0]*$h}sub K{&g(-$i,$Q)-&g($i,-$Q)}
