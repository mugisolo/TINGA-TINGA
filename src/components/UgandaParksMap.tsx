import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  Navigation,
  Mountain,
  Clock,
  Calendar,
} from 'lucide-react';
import { GUIDES, EXPERIENCES } from '../data/seedData';
import { SmartImage } from './SmartImage';
import { useInquiry } from '../context/InquiryContext';

export interface NationalParkMarker {
  id: 'bwindi' | 'kibale' | 'murchison' | 'kidepo';
  name: string;
  shortLabel: string;
  destinationSlug: string;
  regionLabel: string;
  coordinates: [number, number]; // [longitude, latitude]
  coordinatesDisplay: string;
  elevation: string;
  shortDescription: string;
  fieldNote: string;
  driveOrCharter: string;
  bestSeason: string;
  signatureSpecies: string[];
  heroImage: string;
  markerColor: string;
  labelOffset: [number, number];
}

export const MAJOR_UGANDA_PARKS: NationalParkMarker[] = [
  {
    id: 'bwindi',
    name: 'Bwindi Impenetrable National Park',
    shortLabel: 'Bwindi',
    destinationSlug: 'bwindi-mgahinga',
    regionLabel: 'Southwestern Kigezi Highlands',
    coordinates: [29.69, -1.05],
    coordinatesDisplay: '01°03′S · 29°41′E',
    elevation: '1,160m – 2,607m',
    shortDescription:
      'UNESCO-listed montane rainforest harboring nearly half of the world’s remaining mountain gorillas across four trekking sectors (Buhoma, Ruhija, Rushaga, and Nkuringo) and 350+ forest bird species.',
    fieldNote:
      'Early morning mist rises off the Kashasha River valley before trackers lead you to habituated gorilla families.',
    driveOrCharter: '8–9 hr 4x4 drive from Entebbe or 1 hr 15 min scheduled flight to Kihihi / Kisoro',
    bestSeason: 'Jun – Sep & Dec – Feb (Dry) · Apr, May & Nov (Lush Green)',
    signatureSpecies: [
      'Mountain Gorilla',
      'L’Hoest’s Monkey',
      'African Green Broadbill',
      'Forest Elephant',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    markerColor: '#C85A28',
    labelOffset: [16, 4],
  },
  {
    id: 'kibale',
    name: 'Kibale National Park',
    shortLabel: 'Kibale',
    destinationSlug: 'kibale-forest',
    regionLabel: 'Western Albertine Rift & Crater Lakes',
    coordinates: [30.36, 0.49],
    coordinatesDisplay: '00°29′N · 30°21′E',
    elevation: '1,100m – 1,590m',
    shortDescription:
      'East Africa’s premier primate rainforest with 13 primate species and over 1,500 wild chimpanzees. Famous for Kanyanchu morning treks, full-day habituation, and nearby Bigodi Wetland Sanctuary.',
    fieldNote:
      'Listen for pant-hoot calls echoing through towering ironwood and fig canopies at dawn.',
    driveOrCharter: '5–5.5 hr scenic drive from Entebbe via Fort Portal & Ndali-Kasenda Crater Lakes',
    bestSeason: 'Year-round · Peak trail conditions Jun – Sep & Dec – Feb',
    signatureSpecies: [
      'Eastern Chimpanzee',
      'Red Colobus',
      'Great Blue Turaco',
      'Black-and-White Colobus',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1200&q=80',
    markerColor: '#D99B26',
    labelOffset: [16, -6],
  },
  {
    id: 'murchison',
    name: 'Murchison Falls National Park',
    shortLabel: 'Murchison Falls',
    destinationSlug: 'murchison-falls',
    regionLabel: 'Northwestern Victoria Nile & Albert Delta',
    coordinates: [31.72, 2.25],
    coordinatesDisplay: '02°15′N · 31°43′E',
    elevation: '615m – 1,292m',
    shortDescription:
      'Uganda’s largest conservation area where the entire Victoria Nile explodes through a 7-meter cleft in the Rift Valley escarpment, flanked by Borassus palm savanna, Rothschild’s giraffes, lions, and Nile delta shoebills.',
    fieldNote:
      'Combine northern bank game tracks at Buligi with a private afternoon launch to the base of the falls.',
    driveOrCharter: '4.5–5.5 hr drive from Entebbe (via Ziwa Rhino Sanctuary) or 1 hr flight to Pakuba',
    bestSeason: 'Dec – Mar & Jun – Sep',
    signatureSpecies: [
      'Rothschild’s Giraffe',
      'African Lion',
      'Shoebill Stork',
      'Nile Crocodile & Hippo',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    markerColor: '#C85A28',
    labelOffset: [16, 4],
  },
  {
    id: 'kidepo',
    name: 'Kidepo Valley National Park',
    shortLabel: 'Kidepo Valley',
    destinationSlug: 'kidepo-valley',
    regionLabel: 'Far Northeastern Karamoja Frontier',
    coordinates: [33.75, 3.88],
    coordinatesDisplay: '03°52′N · 33°45′E',
    elevation: '914m – 2,750m',
    shortDescription:
      'Dramatic, semi-arid wilderness ringed by Mount Morungole and the Narus and Kidepo seasonal rivers. Home to mega-herds of Cape buffalo, cheetahs, ostriches, and authentic Ik and Karamojong cultural encounters.',
    fieldNote:
      'Solitude on a grand scale — wide golden valleys with zero crowd congestion and unmatched night skies.',
    driveOrCharter: '1 hr 45 min charter flight from Entebbe to Apoka or multi-day northern overland route',
    bestSeason: 'Sep – Mar (Narus Valley waterhole concentrations)',
    signatureSpecies: [
      'Cheetah',
      'Cape Buffalo Herds',
      'Common Ostrich',
      'Karamojong Apalis',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80',
    markerColor: '#D99B26',
    labelOffset: [-16, 22],
  },
];

// High-precision simplified GeoJSON polygon for Uganda's national boundary (counter-clockwise / D3 compatible)
const UGANDA_BOUNDARY_GEOJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: { name: 'Uganda' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [29.57, -1.38],
        [29.82, -1.32],
        [30.47, -1.06],
        [30.82, -1.01],
        [31.78, -1.0],
        [32.15, -0.75],
        [32.85, -0.45],
        [33.42, -0.15],
        [33.94, 0.11],
        [34.01, 0.44],
        [34.15, 0.75],
        [34.56, 1.11],
        [34.78, 1.48],
        [34.92, 1.96],
        [34.96, 2.41],
        [34.58, 3.05],
        [34.45, 3.48],
        [34.12, 3.85],
        [34.01, 4.22],
        [33.52, 4.18],
        [33.05, 3.79],
        [32.48, 3.75],
        [32.02, 3.59],
        [31.42, 3.68],
        [30.92, 3.55],
        [30.83, 3.05],
        [30.78, 2.45],
        [31.18, 2.15],
        [30.82, 1.65],
        [30.35, 1.15],
        [29.95, 0.78],
        [29.75, 0.35],
        [29.62, -0.12],
        [29.55, -0.62],
        [29.57, -1.38],
      ],
    ],
  },
};

// Key Ugandan lakes & Nile geometry for authentic cartographic context
const LAKE_VICTORIA_GEOJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: { name: 'Lake Victoria' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [31.75, -1.0],
        [33.94, 0.11],
        [33.45, 0.42],
        [32.95, 0.35],
        [32.45, 0.08],
        [32.02, -0.22],
        [31.78, -0.68],
        [31.75, -1.0],
      ],
    ],
  },
};

const LAKE_ALBERT_GEOJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: { name: 'Lake Albert' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [30.42, 1.2],
        [30.65, 1.18],
        [31.38, 2.18],
        [31.18, 2.24],
        [30.42, 1.2],
      ],
    ],
  },
};

const LAKE_KYOGA_GEOJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: { name: 'Lake Kyoga' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [32.35, 1.38],
        [33.25, 1.35],
        [33.42, 1.58],
        [32.85, 1.68],
        [32.35, 1.48],
        [32.35, 1.38],
      ],
    ],
  },
};

const LAKE_EDWARD_GEOJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: { name: 'Lake Edward' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [29.58, -0.58],
        [29.88, -0.52],
        [29.92, -0.15],
        [29.62, -0.18],
        [29.58, -0.58],
      ],
    ],
  },
};

const VICTORIA_NILE_GEOJSON: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature',
  properties: { name: 'Victoria Nile' },
  geometry: {
    type: 'LineString',
    coordinates: [
      [33.18, 0.42], // Jinja Source of the Nile
      [32.92, 0.95],
      [32.78, 1.45], // Through Lake Kyoga
      [32.32, 1.68], // Karuma
      [31.72, 2.25], // Murchison Falls cleft
      [31.35, 2.22], // Lake Albert Delta
      [31.48, 2.85], // Albert Nile north toward Nimule
      [32.02, 3.58],
    ],
  },
};

const ENTEBBE_HQ_COORDS: [number, number] = [32.4435, 0.0512];

interface UgandaParksMapProps {
  onSelectDestinationSlug?: (slug: string) => void;
  compactHeader?: boolean;
}

export const UgandaParksMap: React.FC<UgandaParksMapProps> = ({
  onSelectDestinationSlug,
  compactHeader = false,
}) => {
  const { openInquiryModal } = useInquiry();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [selectedParkId, setSelectedParkId] = useState<NationalParkMarker['id']>('bwindi');
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const selectedPark = useMemo(
    () =>
      MAJOR_UGANDA_PARKS.find((p) => p.id === selectedParkId) ||
      MAJOR_UGANDA_PARKS[0],
    [selectedParkId]
  );

  const matchingGuides = useMemo(
    () =>
      GUIDES.filter((g) => {
        const terms = [
          selectedPark.shortLabel.toLowerCase(),
          selectedPark.id.toLowerCase(),
        ];
        const inHome = terms.some((t) => g.homeRegion.toLowerCase().includes(t));
        const inRegions = g.regionsCovered.some((r) =>
          terms.some((t) => r.toLowerCase().includes(t))
        );
        return inHome || inRegions;
      }).slice(0, 3),
    [selectedPark]
  );

  const matchingExperiences = useMemo(
    () =>
      EXPERIENCES.filter((e) => {
        const terms = [
          selectedPark.shortLabel.toLowerCase(),
          selectedPark.id.toLowerCase(),
        ];
        return (
          terms.some((t) => e.region.toLowerCase().includes(t)) ||
          e.regions.some((r) => terms.some((t) => r.toLowerCase().includes(t)))
        );
      }).slice(0, 2),
    [selectedPark]
  );

  const handleParkSelect = (park: NationalParkMarker) => {
    setSelectedParkId(park.id);
    if (onSelectDestinationSlug) {
      onSelectDestinationSlug(park.destinationSlug);
    }
  };

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const width = 680;
    const height = 640;

    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    // Create SVG defs for subtle drop shadow and topographic glow
    const defs = svg.append('defs');

    const shadowFilter = defs
      .append('filter')
      .attr('id', 'uganda-map-shadow')
      .attr('x', '-15%')
      .attr('y', '-15%')
      .attr('width', '130%')
      .attr('height', '130%');

    shadowFilter
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '8')
      .attr('stdDeviation', '10')
      .attr('flood-color', '#0D2616')
      .attr('flood-opacity', '0.55');

    // Configure D3 Mercator projection fitted cleanly to Uganda's boundary
    const projection = d3
      .geoMercator()
      .fitExtent(
        [
          [54, 48],
          [width - 54, height - 54],
        ],
        UGANDA_BOUNDARY_GEOJSON
      );

    const pathGenerator = d3.geoPath().projection(projection);

    // Root zoomable group
    const mapLayer = svg.append('g').attr('class', 'uganda-d3-layer');

    // 1. Graticule / Coordinate Grid
    const graticule = d3.geoGraticule().step([1, 1]);
    mapLayer
      .append('path')
      .datum(graticule())
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#2E8550')
      .attr('stroke-width', 0.6)
      .attr('stroke-dasharray', '2,4')
      .attr('opacity', 0.45);

    // 2. Equator Line (0°00'N)
    const equatorStart = projection([29.1, 0]);
    const equatorEnd = projection([35.3, 0]);
    if (equatorStart && equatorEnd) {
      mapLayer
        .append('line')
        .attr('x1', equatorStart[0])
        .attr('y1', equatorStart[1])
        .attr('x2', equatorEnd[0])
        .attr('y2', equatorEnd[1])
        .attr('stroke', '#D99B26')
        .attr('stroke-width', 1.1)
        .attr('stroke-dasharray', '5,4')
        .attr('opacity', 0.65);

      mapLayer
        .append('text')
        .attr('x', width - 58)
        .attr('y', equatorStart[1] - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#D99B26')
        .attr('font-family', 'IBM Plex Mono, monospace')
        .attr('font-size', '9.5px')
        .attr('letter-spacing', '0.08em')
        .attr('opacity', 0.85)
        .text('EQUATOR 0°00′');
    }

    // 3. Uganda Landmass Polygon
    mapLayer
      .append('path')
      .datum(UGANDA_BOUNDARY_GEOJSON)
      .attr('d', pathGenerator as any)
      .attr('fill', '#1B5632')
      .attr('stroke', '#D99B26')
      .attr('stroke-width', 1.6)
      .attr('stroke-opacity', 0.7)
      .attr('filter', 'url(#uganda-map-shadow)');

    // Inner topographic contour ring for cartographic depth
    mapLayer
      .append('path')
      .datum(UGANDA_BOUNDARY_GEOJSON)
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#34945A')
      .attr('stroke-width', 0.75)
      .attr('opacity', 0.5);

    // 4. Major Lakes & Victoria Nile
    const lakes = [
      { data: LAKE_VICTORIA_GEOJSON, label: 'LAKE VICTORIA', labelPos: [32.85, -0.38] as [number, number] },
      { data: LAKE_ALBERT_GEOJSON, label: 'L. ALBERT', labelPos: [30.88, 1.72] as [number, number] },
      { data: LAKE_KYOGA_GEOJSON, label: 'L. KYOGA', labelPos: [32.88, 1.5] as [number, number] },
      { data: LAKE_EDWARD_GEOJSON, label: 'L. EDWARD', labelPos: [29.73, -0.36] as [number, number] },
    ];

    lakes.forEach((lake) => {
      mapLayer
        .append('path')
        .datum(lake.data)
        .attr('d', pathGenerator as any)
        .attr('fill', '#113A44')
        .attr('stroke', '#3E8E9E')
        .attr('stroke-width', 0.9)
        .attr('opacity', 0.9);

      const labelPoint = projection(lake.labelPos);
      if (labelPoint) {
        mapLayer
          .append('text')
          .attr('x', labelPoint[0])
          .attr('y', labelPoint[1])
          .attr('text-anchor', 'middle')
          .attr('fill', '#7CC6D6')
          .attr('font-family', 'IBM Plex Mono, monospace')
          .attr('font-size', '8.5px')
          .attr('letter-spacing', '0.08em')
          .attr('opacity', 0.85)
          .text(lake.label);
      }
    });

    // Victoria Nile River Path
    mapLayer
      .append('path')
      .datum(VICTORIA_NILE_GEOJSON)
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#4FA8BA')
      .attr('stroke-width', 1.8)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.85);

    // 5. Safari Route Arcs from Entebbe HQ to the 4 National Parks
    const entebbePoint = projection(ENTEBBE_HQ_COORDS);
    if (showRoutes && entebbePoint) {
      const routesGroup = mapLayer.append('g').attr('class', 'safari-routes');

      MAJOR_UGANDA_PARKS.forEach((park) => {
        const targetPoint = projection(park.coordinates);
        if (!targetPoint) return;

        const isSelected = park.id === selectedParkId;
        const dx = targetPoint[0] - entebbePoint[0];
        const dy = targetPoint[1] - entebbePoint[1];
        const controlX = (entebbePoint[0] + targetPoint[0]) / 2 - dy * 0.16;
        const controlY = (entebbePoint[1] + targetPoint[1]) / 2 + dx * 0.12;

        const pathData = `M ${entebbePoint[0]},${entebbePoint[1]} Q ${controlX},${controlY} ${targetPoint[0]},${targetPoint[1]}`;

        routesGroup
          .append('path')
          .attr('d', pathData)
          .attr('fill', 'none')
          .attr('stroke', isSelected ? '#D99B26' : '#FAF7F2')
          .attr('stroke-width', isSelected ? 2.4 : 1.1)
          .attr('stroke-dasharray', isSelected ? '6,4' : '3,5')
          .attr('opacity', isSelected ? 0.95 : 0.35);
      });
    }

    // 6. Entebbe Coordination HQ Hub Marker
    if (entebbePoint) {
      const hqGroup = mapLayer
        .append('g')
        .attr('transform', `translate(${entebbePoint[0]}, ${entebbePoint[1]})`);

      hqGroup
        .append('circle')
        .attr('r', 5.5)
        .attr('fill', '#FAF7F2')
        .attr('stroke', '#144225')
        .attr('stroke-width', 2);

      hqGroup
        .append('circle')
        .attr('r', 2.2)
        .attr('fill', '#C85A28');

      hqGroup
        .append('text')
        .attr('x', 10)
        .attr('y', 4)
        .attr('fill', '#FAF7F2')
        .attr('font-family', 'IBM Plex Mono, monospace')
        .attr('font-size', '9.5px')
        .attr('font-weight', '600')
        .text('ENTEBBE HQ');
    }

    // 7. Custom Interactive National Park Markers (Bwindi, Kibale, Murchison, Kidepo)
    const markersGroup = mapLayer.append('g').attr('class', 'park-markers');

    MAJOR_UGANDA_PARKS.forEach((park, index) => {
      const projected = projection(park.coordinates);
      if (!projected) return;

      const isSelected = park.id === selectedParkId;

      const markerGroup = markersGroup
        .append('g')
        .attr('transform', `translate(${projected[0]}, ${projected[1]})`)
        .style('cursor', 'pointer')
        .attr('role', 'button')
        .attr('tabindex', 0)
        .attr('aria-label', `Select ${park.name}`)
        .on('click', (event) => {
          event.stopPropagation();
          handleParkSelect(park);
        });

      // Outer halo / pulse ring for selected park
      if (isSelected) {
        const pulseCircle = markerGroup
          .append('circle')
          .attr('r', 22)
          .attr('fill', park.markerColor)
          .attr('opacity', 0.25);

        pulseCircle
          .append('animate')
          .attr('attributeName', 'r')
          .attr('values', '14;28;14')
          .attr('dur', '2.4s')
          .attr('repeatCount', 'indefinite');

        pulseCircle
          .append('animate')
          .attr('attributeName', 'opacity')
          .attr('values', '0.45;0.08;0.45')
          .attr('dur', '2.4s')
          .attr('repeatCount', 'indefinite');

        markerGroup
          .append('circle')
          .attr('r', 17)
          .attr('fill', 'none')
          .attr('stroke', '#D99B26')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '3,2');
      }

      // Custom diamond/shield pin base
      markerGroup
        .append('circle')
        .attr('r', isSelected ? 12 : 9.5)
        .attr('fill', isSelected ? '#C85A28' : '#144225')
        .attr('stroke', isSelected ? '#FAF7F2' : '#D99B26')
        .attr('stroke-width', isSelected ? 2.5 : 1.8);

      // Park index number inside marker
      markerGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', '#FAF7F2')
        .attr('font-family', 'IBM Plex Mono, monospace')
        .attr('font-size', isSelected ? '10.5px' : '9.5px')
        .attr('font-weight', '700')
        .text(`0${index + 1}`);

      // Park Label Plinth on Map
      const [offsetX, offsetY] = park.labelOffset;
      const isLeftAligned = offsetX >= 0;

      const labelGroup = markerGroup
        .append('g')
        .attr('transform', `translate(${offsetX}, ${offsetY})`);

      const labelWidth = park.shortLabel.length * 7.2 + 22;

      labelGroup
        .append('rect')
        .attr('x', isLeftAligned ? 0 : -labelWidth)
        .attr('y', -13)
        .attr('width', labelWidth)
        .attr('height', 22)
        .attr('rx', 4)
        .attr('fill', isSelected ? '#FAF7F2' : '#10351E')
        .attr('stroke', isSelected ? '#C85A28' : '#2E8550')
        .attr('stroke-width', isSelected ? 1.5 : 1)
        .attr('opacity', 0.96);

      labelGroup
        .append('text')
        .attr('x', isLeftAligned ? 10 : -10)
        .attr('y', 1)
        .attr('text-anchor', isLeftAligned ? 'start' : 'end')
        .attr('fill', isSelected ? '#1A1612' : '#FAF7F2')
        .attr('font-family', 'Plus Jakarta Sans, sans-serif')
        .attr('font-size', '11px')
        .attr('font-weight', isSelected ? '700' : '600')
        .text(park.shortLabel);
    });

    // 8. Interactive D3 Zoom & Pan Behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 3.2])
      .translateExtent([
        [-80, -80],
        [width + 80, height + 80],
      ])
      .on('zoom', (event) => {
        mapLayer.attr('transform', event.transform.toString());
        setZoomLevel(Number(event.transform.k.toFixed(1)));
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;
  }, [selectedParkId, showRoutes]);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .call(zoomBehaviorRef.current.scaleBy, 1.35);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .call(zoomBehaviorRef.current.scaleBy, 0.75);
  };

  const handleResetView = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(450)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  return (
    <section
      aria-label="Interactive D3 Map of Major Uganda National Parks"
      className="py-16 sm:py-20 bg-[#FAF7F2] border-y border-[#E4DCCF]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
              <Compass className="w-4 h-4 text-[#226B3E]" />
              <span>Interactive D3 Field Atlas · 4 Flagship National Parks</span>
            </div>
            <h2
              className={`font-serif font-bold text-[#1A1612] tracking-tight ${
                compactHeader ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-5xl'
              }`}
            >
              Explore Uganda’s Major National Parks
            </h2>
            <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed">
              Click any custom park marker on the D3 topographic map — or select a park below — to inspect elevation, Entebbe routing, signature wildlife, and the named Ugandan guides who lead safaris in that ecosystem.
            </p>
          </div>

          {/* Interactive Park Selector Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {MAJOR_UGANDA_PARKS.map((park, idx) => {
              const isCurrent = park.id === selectedParkId;
              return (
                <button
                  key={park.id}
                  type="button"
                  onClick={() => handleParkSelect(park)}
                  className={`px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-2 ${
                    isCurrent
                      ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E] shadow-sm'
                      : 'bg-white text-[#1A1612] border-[#E4DCCF] hover:bg-[#F3ECE1]'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] ${
                      isCurrent ? 'text-[#D99B26]' : 'text-[#C85A28]'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <span>{park.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 12-Column Interactive D3 Map & Park Dossier Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 7 Columns: D3 SVG Geographic Visualization */}
          <div className="lg:col-span-7 bg-[#144225] border border-[#2E8550] rounded-lg overflow-hidden flex flex-col justify-between shadow-lg relative">
            {/* Map Top Toolbar */}
            <div className="px-4 sm:px-5 py-3 bg-[#10351E] border-b border-[#2E8550] flex flex-wrap items-center justify-between gap-3">
              <div className="font-mono text-[11px] text-[#D6CEC2] flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>D3 GeoMercator Projection · Uganda (1°S to 4°N)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRoutes((prev) => !prev)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                    showRoutes
                      ? 'bg-[#226B3E] text-[#FAF7F2] border-[#D99B26]/60'
                      : 'bg-[#144225] text-[#D6CEC2] border-white/15 hover:text-white'
                  }`}
                >
                  {showRoutes ? 'Routes: Visible' : 'Routes: Hidden'}
                </button>

                <div className="flex items-center bg-[#144225] border border-white/15 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    title="Zoom In"
                    aria-label="Zoom In Map"
                    className="p-1.5 text-[#FAF7F2] hover:bg-[#226B3E] transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    aria-label="Zoom Out Map"
                    className="p-1.5 text-[#FAF7F2] hover:bg-[#226B3E] transition-colors border-x border-white/10 cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetView}
                    title="Reset Map View"
                    aria-label="Reset Map View"
                    className="p-1.5 text-[#D99B26] hover:bg-[#226B3E] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive SVG Container */}
            <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4 min-h-[420px] sm:min-h-[500px]">
              <svg
                ref={svgRef}
                viewBox="0 0 680 640"
                className="w-full h-auto max-h-[540px] select-none"
                aria-label="Uganda National Parks D3 Map"
              />

              {/* Subtle Bottom-Left Map Legend */}
              <div className="absolute bottom-4 left-4 bg-[#10351E]/90 backdrop-blur-sm border border-[#2E8550] rounded-md px-3.5 py-2.5 text-[11px] font-mono text-[#E4DCCF] space-y-1.5 pointer-events-none">
                <div className="text-[#D99B26] uppercase tracking-wider font-semibold text-[10px]">
                  Map Key · Zoom {zoomLevel}x
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C85A28] inline-block border border-white" />
                  <span>Selected National Park</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#144225] inline-block border border-[#D99B26]" />
                  <span>Major Park Marker (Click to Inspect)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FAF7F2] inline-block border border-[#C85A28]" />
                  <span>Entebbe Coordination HQ</span>
                </div>
              </div>
            </div>

            {/* Map Footer Quick-Click Strip */}
            <div className="px-4 sm:px-5 py-3 bg-[#10351E] border-t border-[#2E8550] flex flex-wrap items-center justify-between gap-2 text-xs text-[#D6CEC2]">
              <span>
                Active Marker:{' '}
                <strong className="text-white">{selectedPark.name}</strong>
              </span>
              <span className="font-mono text-[#D99B26] tabular-nums">
                {selectedPark.coordinatesDisplay} · Elev. {selectedPark.elevation}
              </span>
            </div>
          </div>

          {/* Right 5 Columns: Selected National Park Dossier Card */}
          <div className="lg:col-span-5 bg-white border border-[#E4DCCF] rounded-lg overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              {/* Park Hero Visual */}
              <div className="relative h-52 sm:h-56 bg-[#226B3E] overflow-hidden">
                <SmartImage
                  src={selectedPark.heroImage}
                  alt={selectedPark.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/90 via-[#1A1612]/35 to-transparent" />

                <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between text-xs font-mono text-[#FAF7F2]">
                  <span className="text-[#D99B26] font-semibold uppercase tracking-wider">
                    {selectedPark.regionLabel}
                  </span>
                  <span className="tabular-nums text-[#E4DCCF]">
                    {selectedPark.coordinatesDisplay}
                  </span>
                </div>

                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                    {selectedPark.name}
                  </h3>
                </div>
              </div>

              {/* Park Description & Telemetry */}
              <div className="p-5 sm:p-6 space-y-5">
                <p className="text-sm text-[#1A1612] leading-relaxed">
                  {selectedPark.shortDescription}
                </p>

                <div className="border-l-2 border-[#226B3E] pl-3.5 py-0.5 text-xs italic text-[#5A5248] font-serif">
                  “{selectedPark.fieldNote}”
                </div>

                {/* Clean Inline Metadata Grid (Zero-Pill compliant) */}
                <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-md p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#226B3E] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono uppercase text-[10px] tracking-wider text-[#5A5248] block">
                        Access from Entebbe HQ
                      </span>
                      <span className="text-[#1A1612] font-medium">
                        {selectedPark.driveOrCharter}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2 border-t border-[#E4DCCF]">
                    <Mountain className="w-4 h-4 text-[#C85A28] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono uppercase text-[10px] tracking-wider text-[#5A5248] block">
                        Elevation & Best Season
                      </span>
                      <span className="text-[#1A1612] font-medium tabular-nums">
                        {selectedPark.elevation} · {selectedPark.bestSeason}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signature Species (Unboxed inline typography with middot separators) */}
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#C85A28] font-semibold mb-1.5">
                    Key Wildlife & Species Highlights
                  </div>
                  <p className="text-xs font-mono text-[#226B3E] leading-relaxed">
                    {selectedPark.signatureSpecies.join(' · ')}
                  </p>
                </div>

                {/* Lead Ugandan Guides for this Park */}
                {matchingGuides.length > 0 && (
                  <div className="pt-3 border-t border-[#E4DCCF]">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-[#1A1612] font-semibold mb-2.5">
                      Named Ugandan Specialists for {selectedPark.shortLabel}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {matchingGuides.map((guide) => (
                        <Link
                          key={guide.id}
                          to={`/guides/${guide.slug}`}
                          className="flex items-center gap-2.5 p-2 rounded-md bg-[#FAF7F2] hover:bg-[#F3ECE1] border border-[#E4DCCF] transition-colors group"
                        >
                          <SmartImage
                            src={guide.photo}
                            alt={guide.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#226B3E]"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#1A1612] group-hover:text-[#226B3E] truncate">
                              {guide.name}
                            </div>
                            <div className="text-[10px] font-mono text-[#5A5248] truncate">
                              {guide.yearsExperience} yrs · {guide.homeRegion}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="px-5 sm:px-6 py-4 bg-[#F3ECE1] border-t border-[#E4DCCF] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  openInquiryModal({
                    guideSlug: matchingGuides[0]?.slug,
                    experienceSlug: matchingExperiences[0]?.slug,
                    defaultNotes: `Exploring ${selectedPark.name} via the interactive Uganda map. Interested in a private safari led by an Enganda specialist.`,
                  })
                }
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-md transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#D99B26]" />
                <span>Plan {selectedPark.shortLabel} Safari</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {matchingExperiences[0] ? (
                <Link
                  to={`/experiences/${matchingExperiences[0].slug}`}
                  className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-md bg-white hover:bg-[#FAF7F2] text-[#1A1612] border border-[#E4DCCF] text-xs font-semibold transition-colors"
                >
                  View Itinerary
                </Link>
              ) : (
                <Link
                  to="/destinations"
                  className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-md bg-white hover:bg-[#FAF7F2] text-[#1A1612] border border-[#E4DCCF] text-xs font-semibold transition-colors"
                >
                  All Regions
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
