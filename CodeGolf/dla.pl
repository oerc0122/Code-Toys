$L=1e2;$c=$L/2;$g[$L**2/2+$c]=1;$r=4;$R=7;@q=(1,-1,-$L,$L);print"$c $c
";while($R<$c){$_=rand 6.3;$p=int(sin()*$r+$c)*$L+int(cos()*$r)+$c;a:{$p+=$q[$==rand 4];@B=($==$p/$L,$p%$L);$P=sqrt(($B[0]-$c)**2+($B[1]-$c)**2);for(@q){if($g[$p+$_]){$g[$p]++;$C=$P,$R=++$r+9 if$P>$C;print"@B
";last a}}$P<$R?redo:last}}
