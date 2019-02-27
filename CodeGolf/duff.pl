$$_=rand for A..E;$h=1e-3;$v=1;sub f{$h*(-$A*$_[0]**3+$B*$_[0]-$C*$_[1]+$D*sin$E*$_[2])}while($t<10){$c=$v+&f($x,$v,$t)/2;$v+=&f($x+$v*$h/2,$c,$t+$h/2);$x+=$c*$h;$t+=$h;print"$x $v $t
"}
