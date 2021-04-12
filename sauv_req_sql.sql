drop view  if exists covid19.v_supmkt_ok;
create view covid19.v_supmkt_ok as
select sup.*
From covid19.supmkt_occi as sup
inner join covid19.v_zone_achat as pos ON st_intersects(pos.the_geom,sup.the_geom);

drop view if exists covid19.v_zone_achat;
create view covid19.v_zone_achat as
with tmp_dept as (
	select
		dep.nom,
		dep.the_geom
	from covid19.myposition as pos
	inner join covid19.dept_metropole as dep on st_intersects (pos.the_geom, dep.the_geom)
)
select 
	id,
	ST_UNION(tmp_dept.the_geom,v_30km.the_geom) as the_geom
From covid19.v_30km, tmp_dept;
/*
CREATE MATERIALIZED VIEW covid19.clc18_niv1 AS
Select
	LEFT(code_18,1) as niv1,
	sum (area_ha) as surf_niv1,
	st_multi(ST_union(the_geom))::geometry(MultiPolygon,2154) AS the_geom
from
	covid19.clc_18
Group by
	LEFT(code_18,1)
*/

DROP View if exists covid19.clc18_10km;
CREATE VIEW covid19.clc18_10km AS
Select
	ocs.id,
	ocs.code_18,
	st_multi(ST_intersection(zone.the_geom,ocs.the_geom))::geometry(MultiPolygon,2154) AS the_geom
from
	covid19.clc_18 as ocs,
	covid19.v_10km as zone
Where st_intersects(zone.the_geom, ocs.the_geom);

DROP View if exists covid19.clc18_10km_niv1;
CREATE VIEW covid19.clc18_10km_niv1 AS
Select
	LEFT(code_18,1) as niv1,
	st_multi(ST_union(the_geom))::geometry(MultiPolygon,2154) AS the_geom,
	ST_area(st_multi(ST_union(the_geom))::geometry(MultiPolygon,2154))/10000 as area_ha
from
	covid19.clc18_10km
Group by
	LEFT(code_18,1)