/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from 'd3';
import AssetsLibrary from './AssetsLibrary';
import styles from './SearchPanel.module.css';

// Helper function to safely extract hostname from URLs
const getHostname = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch (e) {
    const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/im);
    return match ? match[1] : 'unknown';
  }
};

// Safe getter for the first URL-like value in a mixed field
const getFirstUrl = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && val.length) {
    const first = val[0];
    if (!first) return null;
    if (typeof first === 'string') return first;
    if (first.url) return first.url;
    if (first.src) return first.src;
  }
  if (val.url) return val.url;
  if (val.src) return val.src;
  return null;
};

// Normalize media fields from heterogeneous search result shapes.
const normalizeMedia = (result) => {
  try {
    const imageCandidates = [
      result.image,
      getFirstUrl(result.images),
      result.thumbnail,
      result.thumbnailUrl,
      result.image_url,
      result.imageUrl,
      result.ogImage && (typeof result.ogImage === 'string' ? result.ogImage : result.ogImage.url),
      result.opengraph && (result.opengraph.image || result.opengraph.image_url),
      result.preview && (result.preview.image || result.preview.image_url),
      result.media && (result.media.image || result.media.image_url),
      getFirstUrl(result.attachments)
    ].map(getFirstUrl).find(Boolean) || null;

    const thumbnail = imageCandidates || result.thumbnail || result.thumbnailUrl || null;

    const videoCandidates = [
      result.video,
      getFirstUrl(result.videos),
      result.video_url,
      result.videoUrl,
      result.ogVideo && (typeof result.ogVideo === 'string' ? result.ogVideo : result.ogVideo.url),
      result.opengraph && (result.opengraph.video || result.opengraph.video_url),
      result.preview && (result.preview.video || result.preview.video_url),
      result.media && (result.media.video || result.media.video_url),
      getFirstUrl(result.enclosure)
    ].map(getFirstUrl).find(Boolean) || null;

    return { image: imageCandidates, thumbnail, video: videoCandidates };
  } catch (e) {
    return { image: null, thumbnail: null, video: null };
  }
};

// Hook: call handler when click is outside the ref element
const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

const ImageGallery = ({ images, query }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigateImage = useCallback((direction) => {
    if (!images || images.length === 0) return; // Guard clause inside the function
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    }
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  }, [currentIndex, images]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setSelectedImage(null);
    if (e.key === 'ArrowLeft') navigateImage('prev');
    if (e.key === 'ArrowRight') navigateImage('next');
  }, [navigateImage]);

  useEffect(() => {
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImage, handleKeyDown]);

  // ✅ FIXED: The early return is now AFTER all the Hooks have been called.
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
  <div className={styles.imageGalleryContainer}>
  <div className={styles.galleryHeader}>
          <h4>Visual Results for "{query}"</h4>
          <span className={styles.imageCount}>{images.length} images</span>
        </div>
  <div className={styles.imageGrid}>
          {images.map((img, index) => (
            <div
              key={index}
              className={styles.imageItem}
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedImage(img);
                setCurrentIndex(index);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedImage(img); setCurrentIndex(index); } }}
              aria-label={`Open image ${img.title || index + 1}`}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={img.src}
                  alt={img.alt || `Visual result for ${query}`}
                  loading="lazy"
                  className={styles.lazyImg}
                  onError={(e) => e.target.style.display = 'none'}
                />
                {img.title && <p className={styles.imageCaption}>{img.title}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div className={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={selectedImage?.title || 'Image lightbox'}>
            <button className={styles.lightboxClose} onClick={() => setSelectedImage(null)}>
              &times;
            </button>
            <button className={`${styles.lightboxNav} ${styles.prev}`} onClick={() => navigateImage('prev')}>
              &#10094;
            </button>
            <img src={selectedImage.src} alt={selectedImage.alt} />
            <button className={`${styles.lightboxNav} ${styles.next}`} onClick={() => navigateImage('next')}>
              &#10095;
            </button>
            <div className={styles.lightboxCaption}>
              <h4>{selectedImage.title}</h4>
              <a href={selectedImage.url} target="_blank" rel="noopener noreferrer">
                View Source
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Video gallery + lightbox
const VideoLightbox = ({ video, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  if (!video) return null;
  return (
    <div className={styles.videoLightbox} onClick={onClose}>
      <div className={styles.videoLightboxContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.lightboxClose} onClick={onClose}>&times;</button>
        <div className={styles.videoPlayerWrap}>
          <video controls src={video.src || video.url} poster={video.poster || video.thumbnail} style={{ maxWidth: '100%' }} />
        </div>
        <div className={styles.lightboxCaption}>
          <h4>{video.title}</h4>
          {video.url && <a href={video.url} target="_blank" rel="noopener noreferrer">View Source</a>}
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const VideoGallery = ({ videos, query }) => {
  const [selected, setSelected] = useState(null);
  const [index, setIndex] = useState(0);
  // Keep hooks unconditionally at the top of the component to satisfy
  // the Rules of Hooks. The effect guards internally to avoid dereferencing
  // `videos` when it is empty or undefined.
  useEffect(() => {
    if (!videos || videos.length === 0) return;
    if (selected) {
      // ensure index is valid before updating selected
      const idx = Math.min(Math.max(0, index), videos.length - 1);
      setSelected(videos[idx]);
    }
  }, [index, videos, selected]);

  if (!videos || videos.length === 0) return null;

  const open = (v, i) => { setSelected(v); setIndex(i); };
  const prev = () => setIndex(i => (i === 0 ? videos.length - 1 : i - 1));
  const next = () => setIndex(i => (i === videos.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className={styles.videoGalleryContainer}>
        <div className={styles.galleryHeader}>
          <h4>Video Results for "{query}"</h4>
          <span className={styles.videoCount}>{videos.length} videos</span>
        </div>
        <div className={styles.videoGrid}>
          {videos.map((v, i) => (
            <div
              key={i}
              className={styles.videoItem}
              role="button"
              tabIndex={0}
              onClick={() => open(v, i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') open(v, i); }}
              aria-label={`Open video ${v.title || i + 1}`}
            >
              <div className={styles.videoThumb}>
                {v.thumbnail ? (
                  <img src={v.thumbnail} alt={v.title || `Video ${i+1}`} loading="lazy" onError={(e)=> e.target.style.display='none'} className={styles.lazyImg} />
                ) : (
                  <video src={v.src || v.url} preload="metadata" muted playsInline style={{ maxWidth: '100%' }} />
                )}
                <div className={styles.videoPlayOverlay} aria-hidden>▶</div>
              </div>
              {v.title && <p className={styles.videoCaption}>{v.title}</p>}
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <VideoLightbox video={selected} onClose={() => setSelected(null)} onPrev={prev} onNext={next} />
      )}
    </>
  );
};


// Interactive Knowledge Graph with D3.js
const KnowledgeGraph = ({ query, entities, onNodeClick, expanded = false }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [graphMode, setGraphMode] = useState('force'); // 'force' or 'radial'

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        setDimensions({
          width: svgRef.current.parentElement.clientWidth,
          height: expanded ? 500 : 300
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [expanded]);

  useEffect(() => {
    if (!entities || entities.length === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;
    const svg = d3.select(svgRef.current);

    // Clear previous graph
    svg.selectAll("*").remove();

    // Create simulation
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Prepare nodes and links
    const nodes = [
      { id: "center", label: query, isCenter: true, radius: 20 },
      ...entities.map((entity, i) => ({
        id: entity,
        label: entity,
        isCenter: false,
        radius: 10,
        group: Math.floor(i % 5) // For color grouping
      }))
    ];

    const links = entities.map(entity => ({
      source: "center",
      target: entity,
      value: 1
    }));

    // Color scale for groups
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Draw nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("click", (event, d) => {
        if (!d.isCenter) {
          setSelectedNode(d);
          onNodeClick(d.label);
        }
      });

    node.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.isCenter ? "#4a90e2" : colorScale(d.group))
      .attr("stroke", d => d.isCenter ? "#2a70c2" : "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .text(d => d.label.length > 15 ? d.label.substring(0, 15) + "..." : d.label)
      .attr("text-anchor", "middle")
      .attr("dy", d => d.isCenter ? 30 : 20)
      .attr("font-size", d => d.isCenter ? "14px" : "12px")
      .attr("font-weight", d => d.isCenter ? "bold" : "normal")
      .attr("fill", "#333");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        svg.selectAll('.nodes, .links').attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Add node tooltips
    node.append('title')
      .text(d => d.label);

    // Add double-click to reset zoom
    svg.on('dblclick.zoom', () => {
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
      );
      setZoomLevel(1);
    });

    // Add simulation
    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);

    function ticked() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => simulation.stop();
  }, [entities, dimensions, query, onNodeClick, graphMode]);

  if (!entities || entities.length === 0) return null;

  return (
    <div className={styles.knowledgeGraphContainer}>
      <div className={styles.graphControls}>
        <button
          className={`graph-mode-btn ${graphMode === 'force' ? 'active' : ''}`}
          onClick={() => setGraphMode('force')}
        >
          Force Layout
        </button>
        <button
          className={`graph-mode-btn ${graphMode === 'radial' ? 'active' : ''}`}
          onClick={() => setGraphMode('radial')}
        >
          Radial Layout
        </button>
        <button
          className={styles.resetZoomBtn}
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().duration(750).call(
              svg.zoom().transform,
              d3.zoomIdentity
            );
            setZoomLevel(1);
          }}
        >
          Reset Zoom
        </button>
  <span className={styles.zoomLevel}>Zoom: {Math.round(zoomLevel * 100)}%</span>
      </div>

  <div className={styles.knowledgeGraphSvgWrapper}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>

      {selectedNode && (
  <div className={styles.nodeDetailsPanel}>
          <h4>{selectedNode.label}</h4>
          <p>Connected to: "{query}"</p>
          <button
            className={styles.closeDetailsBtn}
            onClick={() => setSelectedNode(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// Advanced Filter Component
const AdvancedFilters = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const ref = useRef();

  useOnClickOutside(ref, () => setIsOpen(false));

  // Add preset filter options
  const timePresets = [
    { label: "Last 24 hours", value: "1d" },
    { label: "Last week", value: "1w" },
    { label: "Last month", value: "1m" },
    { label: "Last year", value: "1y" },
    { label: "Custom range", value: "custom" }
  ];

  const handleTimePreset = (preset) => {
    if (preset === 'custom') return;

    const now = new Date();
    let startDate = new Date();

    switch(preset) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '1w':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return;
    }

    onFilterChange('startDate', startDate.toISOString().split('T')[0]);
    onFilterChange('endDate', now.toISOString().split('T')[0]);
  };

  return (
  <div className={styles.advancedFilters} ref={ref}>
      <button
  className={styles.filterToggle}
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className={`icon-filter ${isOpen ? 'active' : ''}`}></i>
        Advanced Filters
        {Object.values(filters).filter(v => v).length > 0 && (
          <span className={styles.filterCount}>{Object.values(filters).filter(v => v).length}</span>
        )}
      </button>

      {isOpen && (
  <div className={styles.filterPanel}>
    <div className={styles.filterTabs}>
            <button
              className={activeTab === 'content' ? 'active' : ''}
              onClick={() => setActiveTab('content')}
            >
              Content
            </button>
            <button
              className={activeTab === 'source' ? 'active' : ''}
              onClick={() => setActiveTab('source')}
            >
              Source
            </button>
            <button
              className={activeTab === 'advanced' ? 'active' : ''}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced
            </button>
          </div>

          <div className={styles.filterTabContent}>
            {activeTab === 'content' && (
              <>
                <div className={styles.filterGroup}>
                  <label>Content Type</label>
                  <div className={styles.filterOptions}>
                    {['article', 'image', 'video', 'academic', 'news', 'forum'].map(type => (
                      <label key={type} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          checked={filters.contentType === type}
                          onChange={(e) => onFilterChange('contentType', e.target.checked ? type : '')}
                        />
                        <span className={styles.checkmark}></span>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Reading Level</label>
                  <select
                    value={filters.readingLevel || ''}
                    onChange={(e) => onFilterChange('readingLevel', e.target.value)}
                  >
                    <option value="">Any level</option>
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="technical">Technical/Expert</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Language</label>
                  <select
                    value={filters.language || 'en'}
                    onChange={(e) => onFilterChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ru">Russian</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'source' && (
              <>
                <div className="filter-group">
                  <label>Domain</label>
                  <input
                    type="text"
                    value={filters.domain || ''}
                    onChange={(e) => onFilterChange('domain', e.target.value)}
                    placeholder="e.g., wikipedia.org"
                  />
                </div>

                <div className="filter-group">
                  <label>Source Reliability</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={filters.reliability || 3}
                      onChange={(e) => onFilterChange('reliability', parseInt(e.target.value))}
                    />
                    <div className="slider-labels">
                      <span>Any</span>
                      <span>Trusted Only</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'advanced' && (
              <>
                <div className="filter-group">
                  <label>Date Range</label>
                  <div className="date-presets">
                    {timePresets.map(preset => (
                      <button
                        key={preset.value}
                        className={filters.datePreset === preset.value ? 'active' : ''}
                        onClick={() => handleTimePreset(preset.value)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="date-inputs">
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => onFilterChange('startDate', e.target.value)}
                      placeholder="Start date"
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => onFilterChange('endDate', e.target.value)}
                      placeholder="End date"
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>File Type</label>
                  <select
                    value={filters.fileType || ''}
                    onChange={(e) => onFilterChange('fileType', e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">Word Document</option>
                    <option value="ppt">PowerPoint</option>
                    <option value="xls">Excel</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Results with</label>
                  <div className="filter-options">
                    <label className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters.hasImages || false}
                        onChange={(e) => onFilterChange('hasImages', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Images
                    </label>
                    <label className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters.hasVideos || false}
                        onChange={(e) => onFilterChange('hasVideos', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Videos
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="filter-actions">
            <button
              className="clear-filters"
              onClick={() => {
                onFilterChange('clear', null);
              }}
            >
              Clear All
            </button>
            <button
              className="apply-filters"
              onClick={() => setIsOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// MediaPanel: shows thumbnails for images and videos related to the current search
const MediaPanel = ({ images = [], videos = [], query }) => {
  if ((!images || images.length === 0) && (!videos || videos.length === 0)) return null;
  return (
    <div className="media-panel agent-card">
      <div className="card-header">
        <h4>Media: "{query}"</h4>
      </div>
      <div className="media-grid">
        {images.map((img) => (
          <div key={`img-${img.id}`} className="media-thumb">
            <img src={img.src} alt={img.alt || query} loading="lazy" onError={(e) => e.target.style.display = 'none'} />
          </div>
        ))}

        {videos.map((v, i) => (
          <div key={`vid-${i}`} className="media-thumb video">
            {v.thumbnail ? (
              <img src={v.thumbnail} alt={v.title || query} loading="lazy" onError={(e) => e.target.style.display = 'none'} />
            ) : (
              <video src={v.src} preload="metadata" muted playsInline />
            )}
            <div className="play-overlay">▶</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// NewsPanel: lightweight news items list related to the search (uses searchResults to pick news-like items)
const NewsPanel = ({ results = [], query }) => {
  // heuristically pick items with 'news' or recent dates
  const newsItems = results.filter(r => (r.source && r.source.toLowerCase().includes('news')) || (r.date && (new Date() - new Date(r.date) < 1000 * 60 * 60 * 24 * 365))).slice(0, 6);
  if (newsItems.length === 0) return null;
  return (
    <div className="news-panel agent-card">
      <div className="card-header">
        <h4>News for "{query}"</h4>
      </div>
      <ul className="news-list">
        {newsItems.map((n, i) => (
          <li key={i} className="news-item">
            <a href={n.url} target="_blank" rel="noopener noreferrer">{n.title}</a>
            <div className="news-meta">{getHostname(n.url)}{n.date && ` • ${new Date(n.date).toLocaleDateString()}`}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Sentiment Analysis Visualization
const SentimentAnalysis = ({ results }) => {
  const positiveCount = results.filter(r => r.sentiment > 0).length;
  const negativeCount = results.filter(r => r.sentiment < 0).length;
  const neutralCount = results.filter(r => r.sentiment === 0).length;
  const total = results.length;

  if (total === 0) return null;

  return (
    <div className="sentiment-analysis">
      <h4>Sentiment Analysis of Sources</h4>
      <div className="sentiment-chart">
        <div className="sentiment-bar">
          <div
            className="sentiment-positive"
            style={{ width: `${(positiveCount / total) * 100}%` }}
            title={`Positive: ${positiveCount} sources`}
          ></div>
          <div
            className="sentiment-neutral"
            style={{ width: `${(neutralCount / total) * 100}%` }}
            title={`Neutral: ${neutralCount} sources`}
          ></div>
          <div
            className="sentiment-negative"
            style={{ width: `${(negativeCount / total) * 100}%` }}
            title={`Negative: ${negativeCount} sources`}
          ></div>
        </div>
        <div className="sentiment-legend">
          <span className="positive">Positive ({positiveCount})</span>
          <span className="neutral">Neutral ({neutralCount})</span>
          <span className="negative">Negative ({negativeCount})</span>
        </div>
      </div>
    </div>
  );
};

// Source Reliability Indicator
const ReliabilityIndicator = ({ source }) => {
  const getReliabilityScore = (domain) => {
    const reliableDomains = ['wikipedia.org', 'nih.gov', 'harvard.edu', 'stanford.edu', 'bbc.com', 'reuters.com'];
    const questionableDomains = ['blogspot.com', 'wordpress.com', 'medium.com'];

    if (reliableDomains.some(d => domain.includes(d))) return 5;
    if (questionableDomains.some(d => domain.includes(d))) return 2;
    return 3;
  };

  const score = getReliabilityScore(getHostname(source.url));

  return (
    <div className="reliability-indicator" title={`Reliability score: ${score}/5`}>
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < score ? 'active' : ''}>★</span>
      ))}
    </div>
  );
};

// Rich result modal: shows media, files, links, insights and deep actions
const RichResultModal = ({ result, onClose }) => {
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);
  const [closing, setClosing] = useState(false);

  const fetchAiInsight = async () => {
    if (!result || !result.url) return;
    setLoadingInsight(true);
    try {
      // Placeholder: backend endpoint may generate insight summary or extract key points
      const resp = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: result.url, title: result.title })
      });
      if (resp.ok) {
        const data = await resp.json();
        setAiInsight(data.insight || data.summary || JSON.stringify(data));
      } else {
        setAiInsight('No automated insight available.');
      }
    } catch (e) {
      setAiInsight('Insight generation failed: ' + e.message);
    } finally {
      setLoadingInsight(false);
    }
  };

  // auto-fetch a lightweight insight when modal opens (non-blocking)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (result) fetchAiInsight();
  }, [result]);

  // focus management & focus trap
  // focus management uses modalRef; disabling exhaustive-deps is acceptable here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!modalRef.current) return;
    // save previously focused element
    previouslyFocused.current = document.activeElement;
    // add modal-open class to body to prevent scroll
    document.body.classList.add('modal-open');

    const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(modalRef.current.querySelectorAll(focusableSelectors));
    if (focusable.length) focusable[0].focus();

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        // animate close
        setClosing(true);
        setTimeout(() => onClose && onClose(), 160);
      }
      if (e.key === 'Tab') {
        // focus trap
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

  // attach in capture phase so modal handles keys before other global listeners
  document.addEventListener('keydown', handleKey, true);

    return () => {
      document.removeEventListener('keydown', handleKey, true);
      document.body.classList.remove('modal-open');
      // restore focus
      try { previouslyFocused.current && previouslyFocused.current.focus(); } catch (e) {}
    };
  }, [modalRef]);

  if (!result) return null;

  const mediaList = [];
  if (result._media) {
    if (result._media.image) mediaList.push({ type: 'image', src: result._media.image });
    if (result._media.thumbnail) mediaList.push({ type: 'image', src: result._media.thumbnail });
    if (result._media.video) {
      const v = result._media.video;
      // Detect YouTube watch or short links and normalize to embed
      const ytMatch = (v || '').match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,15})/);
      if (ytMatch) {
        mediaList.push({ type: 'video', src: `https://www.youtube.com/embed/${ytMatch[1]}`, thumbnail: result._media.thumbnail, provider: 'youtube' });
      } else {
        mediaList.push({ type: 'video', src: v, thumbnail: result._media.thumbnail });
      }
    }
  }
  if (result.attachments && Array.isArray(result.attachments)) {
    result.attachments.forEach(a => { if (a.url || a.src) mediaList.push({ type: 'file', src: a.url || a.src, name: a.name || a.filename }); });
  }

  return (
    <div className="rich-modal" role="dialog" aria-modal="true" onClick={() => {
      // animated close on overlay click
      setClosing(true);
      setTimeout(() => onClose && onClose(), 180);
    }}>
      <div
        ref={modalRef}
        className={`rich-modal-content ${closing ? 'modal-fade-out' : 'modal-fade-in'}`}
        onClick={(e) => e.stopPropagation()}
        aria-label={result.title || 'Result details'}
      >
        <div className="rich-modal-header">
          <h3>{result.title}</h3>
          <div className="rich-modal-meta">
            <span className="source">{getHostname(result.url)}</span>
            {result.date && <span className="date">{new Date(result.date).toLocaleString()}</span>}
          </div>
          <button className="close" onClick={() => { setClosing(true); setTimeout(() => onClose && onClose(), 160); }} aria-label="Close">×</button>
        </div>

        <div className="rich-modal-body">
          <div className="rich-left">
            <div className="rich-media-carousel">
              {mediaList.length > 0 ? mediaList.map((m, i) => (
                <div key={i} className={`media-item ${m.type}`}>
                  {m.type === 'image' && <img src={m.src} alt={result.title} loading="lazy" onError={(e)=> e.target.style.display='none'} />}
                  {m.type === 'video' && (
                    m.provider === 'youtube' ? (
                      <div className="video-embed-wrapper">
                        <iframe src={m.src} title={result.title} frameBorder="0" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
                      </div>
                    ) : (
                      <video controls src={m.src} poster={m.thumbnail || ''} style={{ maxWidth: '100%' }} />
                    )
                  )}
                  {m.type === 'file' && (
                    <div className={styles.fileCard}>
                      <i className="icon-file"></i>
                      <div className="file-meta">
                        <div className="file-name">{m.name || m.src}</div>
                        <button onClick={() => window.open(m.src, '_blank')}>Open</button>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className={styles.noMedia}>No preview media available.</div>
              )}
            </div>

            <div className={styles.richLinks}>
              <h5>Links & Outbound</h5>
              <div className="links-list">
                <a href={result.url} target="_blank" rel="noopener noreferrer">Open Source Page</a>
                {(result.outlinks || result.links || []).slice(0,10).map((l, i) => (
                  <div key={i} className={styles.outlinkItem}>
                    <a href={l.url || l} target="_blank" rel="noopener noreferrer">{l.title || l.url || l}</a>
                    <span className={styles.outlinkHost}>{getHostname(l.url || l)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.richRight}>
            <div className={styles.quickActions}>
              <button onClick={() => navigator.clipboard.writeText(result.url)}>Copy Link</button>
              <button onClick={() => window.open(result.url, '_blank')}>Open in New Tab</button>
              <button onClick={() => { if (result._media && (result._media.image || result._media.video)) window.open(result._media.image || result._media.video, '_blank'); }}>Open Media</button>
              <button onClick={() => { alert('Smart download: preparing assets...'); /* Could trigger /api/fetch-bundle */ }}>Download All</button>
            </div>

            <div className={styles.insights}>
              <h5>AI Insight</h5>
              {loadingInsight ? <div className={`${styles.spinner} small`}></div> : (
                <div className={styles.insightText}>{aiInsight || 'No insight available yet.'}</div>
              )}
              <div className={styles.insightActions}>
                <button onClick={fetchAiInsight}>Regenerate Insight</button>
                <button onClick={() => { navigator.clipboard.writeText(aiInsight || ''); }}>Copy Insight</button>
              </div>
            </div>

            <div className="file-attachments">
              <h5>Files & Attachments</h5>
              {(result.files || []).length === 0 && <div className="no-files">No files attached.</div>}
              <ul>
                {(result.files || []).map((f, i) => (
                  <li key={i} className="attachment-item">
                    <span className="file-name">{f.name || f.filename || f.url}</span>
                    <div className="attachment-actions">
                      <button onClick={() => window.open(f.url || f.src, '_blank')}>Open</button>
                      <button onClick={() => { fetch('/api/fetch-asset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: f.url || f.src }) }).then(r=>r.json()).then(d=> { if (d && d.url) window.open(d.url); }); }}>Download</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Search Result Item
const SearchResultItem = ({ result, index, onSave, onShare, onCite }) => {
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showRich, setShowRich] = useState(false);

  const handleSave = () => {
    setBookmarked(!bookmarked);
    onSave && onSave(result);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: result.title,
        text: result.snippet,
        url: result.url,
      })
      .catch(console.error);
    } else {
      onShare && onShare(result);
    }
  };

  const handleCite = () => {
    const citation = `${result.authors && `${result.authors.join(', ')}. `}"${result.title}". ${getHostname(result.url)}. ${result.date && ` ${new Date(result.date).getFullYear()}.`}`;
    navigator.clipboard.writeText(citation);
    onCite && onCite(result);
  };

  // Download asset helper: ask backend to fetch and return a served URL
  const downloadAsset = async (assetUrl) => {
    try {
      if (!assetUrl) return alert('No asset URL available to download.');
      const resp = await fetch('/api/fetch-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: assetUrl })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        console.error('fetch-asset failed', data);
        return alert('Failed to fetch asset: ' + (data.error || data.message || 'unknown'));
      }
      // Create an invisible anchor to download the served file
      const a = document.createElement('a');
      a.href = data.url;
      a.download = data.filename || '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('downloadAsset error', e);
      alert('Error downloading asset');
    }
  };

  const openMedia = (e) => {
    e && e.stopPropagation();
    const asset = result._media && (result._media.video || result._media.image || result._media.thumbnail);
    if (!asset) return alert('No media to open');
    // If it's a video URL pointing to YouTube, open in new tab; otherwise try same origin
    window.open(asset, '_blank', 'noopener');
  };

  const viewDetails = (e) => {
    e && e.stopPropagation();
    setShowRich(true);
  };

  const downloadAllMedia = async (e) => {
    e && e.stopPropagation();
    // gather media sources from result._media and attachments
    const assets = [];
    if (result._media) {
      if (result._media.image) assets.push(result._media.image);
      if (result._media.thumbnail) assets.push(result._media.thumbnail);
      if (result._media.video) assets.push(result._media.video);
    }
    if (result.attachments && Array.isArray(result.attachments)) {
      result.attachments.forEach(a => { if (a.url) assets.push(a.url); if (a.src) assets.push(a.src); });
    }
    if (assets.length === 0) return alert('No downloadable media found');
    // trigger sequential downloads to avoid overwhelming the browser
    for (const src of assets) {
      // eslint-disable-next-line no-await-in-loop
      await downloadAsset(src);
    }
  };

  return (
    <div className={`search-result ${expanded ? 'expanded' : ''}`}>
      <div className="result-main" onClick={() => setExpanded(!expanded)}>
        <div className="result-header">
          <img
            src={`https://www.google.com/s2/favicons?domain=${getHostname(result.url)}&sz=32`}
            alt="source favicon"
            className="result-favicon"
          />
          <div className="result-title-container">
            <h4>
              <a href={result.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                {result.title}
              </a>
            </h4>
            <div className="result-meta">
              <span className="result-source">{getHostname(result.url)}</span>
              {result.source && <span className="result-source-badge">{result.source}</span>}
              {result.date && <span className="result-date">{new Date(result.date).toLocaleDateString()}</span>}
            </div>
          </div>

          <div className="result-actions">
            <button
              className={`bookmark-btn ${bookmarked ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              title="Save to library"
            >
              <i className="icon-bookmark"></i>
            </button>

            <button
              className="share-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              title="Share result"
            >
              <i className="icon-share"></i>
            </button>

            <button
              className="cite-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleCite();
              }}
              title="Copy citation"
            >
              <i className="icon-cite"></i>
            </button>

            {/* Download button for media */}
            {result._media && (result._media.image || result._media.video || result._media.thumbnail) && (
              <button
                className="download-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const asset = result._media.image || result._media.video || result._media.thumbnail;
                  downloadAsset(asset);
                }}
                title="Download media"
              >
                <i className="icon-download"></i>
              </button>
            )}

            <button className="open-media-btn" onClick={(e) => { e.stopPropagation(); openMedia(e); }} title="Open media in new tab">Open Media</button>

            <button className="view-details-btn" onClick={(e) => { e.stopPropagation(); viewDetails(e); }} title="View details">View Details</button>

            <button className="download-all-btn" onClick={(e) => { e.stopPropagation(); downloadAllMedia(e); }} title="Download all media">Download All</button>

            <button className="expand-toggle">
              {expanded ? <i className="icon-collapse"></i> : <i className="icon-expand"></i>}
            </button>
          </div>
        </div>

        <div className="result-content">
          <p className="result-snippet">{result.snippet || "No snippet available."}</p>

          {/* Media preview (image or video thumbnail) - use normalized media keys */}
          {result._media && (result._media.image || result._media.thumbnail) && (
            <div className="result-media">
              <img src={result._media.image || result._media.thumbnail} alt={result.title} loading="lazy" onError={(e)=> e.target.style.display='none'} />
              {result._media.video && (
                <div className="play-overlay">▶</div>
              )}
            </div>
          )}

          {/* Debug: small media badge to help identify which fields are present (remove in production) */}
          <div className="media-debug tiny muted" aria-hidden>
            {result._media ? `image:${Boolean(result._media.image)} thumb:${Boolean(result._media.thumbnail)} video:${Boolean(result._media.video)}` : 'media:none'}
          </div>

          <div className="result-quality-indicators">
            {result.score !== undefined && (
              <div className="quality-indicator">
                <span className="indicator-label">Relevance:</span>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{ width: `${(result.score * 100).toFixed(0)}%` }}
                  ></div>
                </div>
                <span className="score-value">{(result.score * 100).toFixed(0)}%</span>
              </div>
            )}

            <ReliabilityIndicator source={result} />

            {result.sentiment !== undefined && (
              <div className="sentiment-indicator">
                <span className="indicator-label">Sentiment:</span>
                <div className={`sentiment-dot ${result.sentiment > 0 ? 'positive' : result.sentiment < 0 ? 'negative' : 'neutral'}`}></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="result-extra-actions">
        <button onClick={(e) => { e.stopPropagation(); setShowRich(true); }}>View Details</button>
      </div>

      {showRich && <RichResultModal result={result} onClose={() => setShowRich(false)} />}

      {expanded && (
        <div className="result-details">
          <div className="detail-section">
            <h5>Key Insights</h5>
            <ul>
              {result.keyPoints && result.keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h5>Related Concepts</h5>
            <div className="concept-tags">
              {result.concepts && result.concepts.map((concept, i) => (
                <span key={i} className="concept-tag">{concept}</span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h5>Citation</h5>
            <div className="citation-container">
              <code className="citation">
                {result.authors && `${result.authors.join(', ')}. `}
                "{result.title}". {getHostname(result.url)}.
                {result.date && ` ${new Date(result.date).getFullYear()}.`}
              </code>
              <button
                className="copy-citation"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${result.authors ? result.authors.join(', ') + '. ' : ''}"${result.title}". ${getHostname(result.url)}. ${result.date ? new Date(result.date).getFullYear() + '.' : ''}`
                  );
                }}
              >
                <i className="icon-copy"></i> Copy
              </button>
            </div>
          </div>

          {result.entities && result.entities.length > 0 && (
            <div className="detail-section">
              <h5>Entities Mentioned</h5>
              <div className="entity-tags">
                {result.entities.map((entity, i) => (
                  <span key={i} className="entity-tag">
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced List View
const ListView = ({ results }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = results.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (page > pages) setPage(1); }, [pages]);

  const start = (page - 1) * pageSize;
  const pageResults = results.slice(start, start + pageSize);

  return (
    <div className="search-results">
      <div className="pagination-controls">
        <div className="pagination-left">
          <label>Results per page:</label>
          <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="pagination-center">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>Prev</button>
          <span>Page {page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages}>Next</button>
        </div>
        <div className="pagination-right">
          <label>Jump to page:</label>
          <input type="number" min={1} max={pages} value={page} onChange={(e) => setPage(Math.min(Math.max(1, parseInt(e.target.value || 1)), pages))} />
        </div>
      </div>

      {pageResults.map((result, index) => (
        <SearchResultItem
          key={start + index}
          result={result}
          index={start + index}
          onSave={(result) => console.log('Save result:', result)}
          onShare={(result) => console.log('Share result:', result)}
          onCite={(result) => console.log('Cite result:', result)}
        />
      ))}
    </div>
  );
};

// Cluster Visualization View
const ClusterView = ({ results, query }) => {
  // Simple clustering algorithm based on text similarity
  const clusterResults = (results) => {
    if (!results || results.length === 0) return [];

    // Simple keyword-based clustering
    const clusters = {};

    results.forEach(result => {
      const text = `${result.title} ${result.snippet}`.toLowerCase();
      let cluster = 'Other';

      // Simple keyword matching for clustering
      if (text.includes('research') || text.includes('study') || text.includes('data')) {
        cluster = 'Research & Studies';
      } else if (text.includes('news') || text.includes('report') || text.includes('update')) {
        cluster = 'News & Reports';
      } else if (text.includes('guide') || text.includes('how to') || text.includes('tutorial')) {
        cluster = 'Guides & Tutorials';
      } else if (text.includes('review') || text.includes('analysis') || text.includes('opinion')) {
        cluster = 'Analysis & Opinions';
      } else if (text.includes('forum') || text.includes('discussion') || text.includes('community')) {
        cluster = 'Community Discussions';
      }

      if (!clusters[cluster]) clusters[cluster] = [];
      clusters[cluster].push(result);
    });

    return Object.entries(clusters).map(([name, items]) => ({
      name,
      items,
      count: items.length
    }));
  };

  const clusters = clusterResults(results);

  return (
    <div className="cluster-view">
      <div className="cluster-header">
        <h4>Search Clusters for "{query}"</h4>
        <span className="cluster-count">{clusters.length} clusters found</span>
      </div>
      <div className="clusters-container">
        {clusters.map((cluster, index) => (
          <div key={index} className="cluster">
            <div className="cluster-header">
              <h5>{cluster.name} ({cluster.count})</h5>
              <button className="expand-cluster">Expand</button>
            </div>
            <div className="cluster-results">
              {cluster.items.slice(0, 3).map((result, i) => (
                <div key={i} className="cluster-result">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.title}
                  </a>
                  <p>{result.snippet?.substring(0, 100)}...</p>
                </div>
              ))}
              {cluster.items.length > 3 && (
                <div className="cluster-more">
                  + {cluster.items.length - 3} more results
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Timeline Visualization View
const TimelineView = ({ results }) => {
  const timelineResults = results
    .filter(r => r.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (timelineResults.length === 0) {
    return <div className="no-timeline-data">No date information available for timeline view.</div>;
  }

  // Group by year
  const byYear = timelineResults.reduce((acc, result) => {
    const year = new Date(result.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(result);
    return acc;
  }, {});

  return (
    <div className="timeline-view">
      <h4>Results Timeline</h4>
      <div className="timeline-container">
        {Object.entries(byYear)
          .sort(([a], [b]) => b - a)
          .map(([year, items]) => (
            <div key={year} className="timeline-year">
              <h5>{year} ({items.length})</h5>
              <div className="timeline-year-results">
                {items.map((result, i) => (
                  <div key={i} className="timeline-item">
                    <span className="timeline-date">
                      {new Date(result.date).toLocaleDateString()}
                    </span>
                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                      {result.title}
                    </a>
                    <p className="timeline-snippet">{result.snippet?.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

// Enhanced SearchPanel component
const SearchPanel = ({
  agentStatus,
  searchPlan,
  thoughtProcessLog,
  searchResults,
  isSearching,
  onNewSearch,
  suggestedQueries = [],
  searchSummary,
  keyEntities = [],
  searchQuery,
  searchError,
  onExport,
  onFollowUp,
}) => {
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("relevance");
  // plan visibility state removed (not used)
  const [thoughtsVisible, setThoughtsVisible] = useState(false);
  const [filters, setFilters] = useState({});
  const [providers, setProviders] = useState({
    aion: true,
    google: false,
    youtube: false,
    instagram: false,
    twitter: false,
    reddit: false
  });
  // current step index state removed (not used)
  const [viewMode, setViewMode] = useState('list');
  const [savedSessions, setSavedSessions] = useState([]);
  const [, setSelectedSession] = useState(null);
  const [summaryMode, setSummaryMode] = useState('detailed'); // 'brief', 'detailed', 'comprehensive'
  const [graphExpanded, setGraphExpanded] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  // Local search state (when SearchPanel performs its own advanced-search)
  const [localResults, setLocalResults] = useState([]);
  const [localSummary, setLocalSummary] = useState(null);
  const [isLocalSearching, setIsLocalSearching] = useState(false);
  const [localSearchError, setLocalSearchError] = useState(null);
  const [fetchProgress, setFetchProgress] = useState(0);

  // Load saved sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchSessions');
    if (saved) {
      try {
        setSavedSessions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved sessions:', e);
      }
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      handleAdvancedSearch(query);
    }
  };

  // Prefer in-panel localResults when available, otherwise use parent `searchResults`
  const activeSource = (localResults && localResults.length > 0) ? localResults : (searchResults || []);
  const sortedResults = [...activeSource].sort((a, b) => {
    if (sortOption === "relevance") return (b.score || 0) - (a.score || 0);
    if (sortOption === "date") return new Date(b.date || 0) - new Date(a.date || 0);
    if (sortOption === "title") return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  const completedSteps = searchPlan.filter(step => step.status === 'completed').length;
  const totalSteps = searchPlan.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const currentStep = searchPlan.find(step => step.status === 'in_progress') ||
                      searchPlan.find(step => step.status === 'pending');

  // Normalize media fields for each result so the UI can rely on consistent keys.
  const normalizedResults = sortedResults.map((r) => ({
    ...r,
    _media: normalizeMedia(r)
  }));

  const imageResults = normalizedResults
    .filter(r => r._media && (r._media.image || r._media.thumbnail))
    .map((r, index) => ({
      src: r._media.image || r._media.thumbnail,
      url: r.url,
      alt: r.title,
      title: r.title,
      id: index
    }));

  const videoResults = normalizedResults
    .filter(r => r._media && r._media.video)
    .map((r, index) => ({
      src: r._media.video,
      url: r.url,
      thumbnail: r._media.thumbnail || r._media.image,
      title: r.title,
      id: index
    }));

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'clear') {
      setFilters({});
    } else {
      setFilters(prev => ({ ...prev, [filterType]: value }));
    }
  };

  const handleAdvancedSearch = async (q) => {
    const searchQ = (q || '').trim();
    if (!searchQ) return;

    // If parent provided an onNewSearch handler, still call it for global coordination
    try {
      onNewSearch && onNewSearch(searchQ, filters);
    } catch (e) {
      // ignore
    }

    // Perform local advanced search against backend `/api/advanced-search`
    setIsLocalSearching(true);
    setLocalSearchError(null);
    setFetchProgress(5);
    setLocalResults([]);
    setLocalSummary(null);
    setQuery('');

    try {
      // Build provider list from UI toggles; backend will ignore unknown providers
      const selectedProviders = Object.entries(providers).filter(([k,v]) => v).map(([k]) => k);

      // If user selected external providers besides local 'aion', call hybrid-search
      const useHybrid = selectedProviders.some(p => p !== 'aion');
      const endpoint = useHybrid ? '/api/hybrid-search' : '/api/advanced-search';
      const bodyPayload = useHybrid ? { query: searchQ, providers: selectedProviders, filters } : { query: searchQ, filters };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      setFetchProgress(30);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || err.message || `Search failed (${resp.status})`);
      }

      const data = await resp.json();
      setFetchProgress(70);
      // Expect shape: { query, results: [...], raw_results: [...], clusters?, ... }
      const results = data.results || data.raw_results || data.results || data.raw || [];
      const normalized = Array.isArray(results) ? results : (data.results || []);

      // Enrich hybrid results for UI: provide _media keys so galleries/lightboxes work
      const enriched = normalized.map(r => {
        const copy = { ...r };
        // map common fields
        const img = r.image || r.thumbnail || r.thumbnailUrl || r.imageUrl || null;
        const thumb = r.thumbnail || r.thumbnailUrl || r.image || null;
        let video = r.video || r.video_url || r.videoUrl || null;
        // YouTube id -> construct watch URL
        if (!video && r.video_id) {
          video = `https://www.youtube.com/watch?v=${r.video_id}`;
        }
        copy._media = { image: img || null, thumbnail: thumb || null, video: video || null };
        return copy;
      });

      setLocalResults(enriched);
      setLocalSummary(data.summary || data || null);
      setFetchProgress(100);
    } catch (err) {
      console.error('Advanced search error', err);
      setLocalSearchError(err.message || String(err));
    } finally {
      // small delay so progress UI can show completion
      setTimeout(() => setIsLocalSearching(false), 300);
      setTimeout(() => setFetchProgress(0), 800);
    }
  };

  const toggleProvider = (name) => {
    setProviders(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const saveCurrentSession = () => {
    const session = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      query: searchQuery,
      filters: filters,
      results: searchResults,
      summary: searchSummary,
      plan: searchPlan,
      thoughts: thoughtProcessLog
    };

    const updatedSessions = [...savedSessions, session];
    setSavedSessions(updatedSessions);
    localStorage.setItem('searchSessions', JSON.stringify(updatedSessions));
  };

  const loadSession = (sessionId) => {
    const session = savedSessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setFilters(session.filters);
      // In a real implementation, you would update parent state with session data
    }
  };

  const handleAdvancedExport = (format) => {
    const exportData = {
      query: searchQuery,
      timestamp: new Date().toISOString(),
      results: searchResults,
      summary: searchSummary,
      plan: searchPlan,
      thoughts: thoughtProcessLog
    };

    switch(format) {
      case 'json':
        {
          const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          let jsonUrl = null;
          try {
            if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') jsonUrl = URL.createObjectURL(jsonBlob);
            const a = document.createElement('a');
            a.href = jsonUrl || '';
            a.download = `aion-search-${searchQuery}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (e) {
            console.error('Export JSON failed', e);
          } finally {
            try { if (jsonUrl) URL.revokeObjectURL(jsonUrl); } catch (e) {}
          }
        }
        break;

      case 'csv':
        // Convert to CSV format
        let csvContent = "Title,URL,Source,Date,Snippet\n";
        searchResults.forEach(result => {
          csvContent += `"${result.title?.replace(/"/g, '""') || ''}","${result.url || ''}","${getHostname(result.url) || ''}","${result.date || ''}","${result.snippet?.replace(/"/g, '""') || ''}"\n`;
        });

        try {
          const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          let csvUrl = null;
          if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') csvUrl = URL.createObjectURL(csvBlob);
          const csvA = document.createElement('a');
          csvA.href = csvUrl || '';
          csvA.download = `aion-search-${searchQuery}.csv`;
          csvA.style.display = 'none';
          document.body.appendChild(csvA);
          csvA.click();
          document.body.removeChild(csvA);
          try { if (csvUrl) URL.revokeObjectURL(csvUrl); } catch (e) {}
        } catch (e) {
          console.error('Export CSV failed', e);
        }
        break;

      case 'pdf':
        // In a real implementation, you would use a PDF generation library
        alert('PDF export would be implemented with a library like jsPDF');
        break;

      default:
        onExport(); // Use default export
    }
  };

  const renderResults = () => {
    switch(viewMode) {
      case 'cluster':
        return <ClusterView results={normalizedResults} query={searchQuery} />;
      case 'timeline':
        return <TimelineView results={normalizedResults} />;
      default:
        return <ListView results={normalizedResults} />;
    }
  };

  const renderSummary = () => {
    if (!searchSummary) return null;

    // Calculate analytics
    const totalResults = searchResults.length;
    const domains = [...new Set(searchResults.map(r => getHostname(r.url)))];
    const domainCount = domains.length;
    const dateRange = searchResults.reduce((acc, result) => {
      if (!result.date) return acc;
      const date = new Date(result.date);
      if (!acc.start || date < acc.start) acc.start = date;
      if (!acc.end || date > acc.end) acc.end = date;
      return acc;
    }, {});

    const sentimentData = searchResults.reduce((acc, result) => {
      if (result.sentiment > 0) acc.positive++;
      else if (result.sentiment < 0) acc.negative++;
      else acc.neutral++;
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    return (
      <div className="search-summary agent-card">
        <div className="summary-header">
          <h4>
            {summaryMode === 'brief' ? 'Executive Summary' :
             summaryMode === 'detailed' ? 'Detailed Analysis' : 'Comprehensive Report'}
          </h4>
          <div className="summary-controls">
            <div className="summary-mode-selector">
              <button
                className={summaryMode === 'brief' ? 'active' : ''}
                onClick={() => setSummaryMode('brief')}
                title="Brief summary"
              >
                Brief
              </button>
              <button
                className={summaryMode === 'detailed' ? 'active' : ''}
                onClick={() => setSummaryMode('detailed')}
                title="Detailed analysis"
              >
                Detailed
              </button>
              <button
                className={summaryMode === 'comprehensive' ? 'active' : ''}
                onClick={() => setSummaryMode('comprehensive')}
                title="Comprehensive report"
              >
                Comprehensive
              </button>
              <div className="sentiment-summary">
                <small>Sentiment — +{sentimentData.positive} / 0:{sentimentData.neutral} / -{sentimentData.negative}</small>
              </div>
            </div>

            <div className="export-options">
              <button onClick={() => handleAdvancedExport('markdown')} title="Export as Markdown">
                <i className="icon-markdown"></i>
              </button>
              <button onClick={() => handleAdvancedExport('json')} title="Export as JSON">
                <i className="icon-json"></i>
              </button>
              <button onClick={() => handleAdvancedExport('csv')} title="Export as CSV">
                <i className="icon-csv"></i>
              </button>
              <button onClick={() => handleAdvancedExport('pdf')} title="Export as PDF">
                <i className="icon-pdf"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="summary-content">
          {/* Add research analytics dashboard */}
          <div className="research-analytics">
            <div className="analytics-card">
              <div className="analytics-value">{totalResults}</div>
              <div className="analytics-label">Sources Found</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-value">{domainCount}</div>
              <div className="analytics-label">Unique Domains</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-value">
                {dateRange.start && dateRange.end ?
                  `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}` :
                  'N/A'
                }
              </div>
              <div className="analytics-label">Date Range</div>
            </div>
          </div>

          {summaryMode === 'brief' && (
            <div className="brief-summary">
              <p>{searchSummary.split('. ').slice(0, 2).join('. ')}.</p>
            </div>
          )}

          {summaryMode === 'detailed' && (
            <div className="detailed-summary">
              <p>{searchSummary}</p>

              <div className="key-findings">
                <h5>Key Findings:</h5>
                <ul>
                  {searchSummary.split('. ')
                    .filter(s => s.length > 20)
                    .slice(0, 5)
                    .map((point, i) => (
                      <li key={i}>{point}.</li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {summaryMode === 'comprehensive' && (
            <div className="comprehensive-report">
              <div className="report-section">
                <h5>Introduction</h5>
                <p>This comprehensive report provides an in-depth analysis of "{searchQuery}" based on research across {searchResults.length} sources. The information has been synthesized to provide a thorough understanding of the topic.</p>
              </div>

              <div className="report-section">
                <h5>Executive Summary</h5>
                <p>{searchSummary}</p>
              </div>

              <div className="report-section">
                <h5>Detailed Analysis</h5>
                <p>The research reveals several key aspects about {searchQuery}:</p>
                <ul>
                  {searchSummary.split('. ')
                    .filter(s => s.length > 30)
                    .map((point, i) => (
                      <li key={i}>{point}.</li>
                    ))}
                </ul>
              </div>

              <div className="report-section">
                <h5>Key Statistics & Data</h5>
                <div className="data-points">
                  <div className="data-point">
                    <span className="data-value">{searchResults.length}</span>
                    <span className="data-label">Sources Analyzed</span>
                  </div>
                  <div className="data-point">
                    <span className="data-value">{Math.round(searchResults.reduce((acc, r) => acc + (r.score || 0), 0) / searchResults.length * 100)}%</span>
                    <span className="data-label">Average Relevance</span>
                  </div>
                  <div className="data-point">
                    <span className="data-value">{new Set(searchResults.map(r => getHostname(r.url))).size}</span>
                    <span className="data-label">Unique Domains</span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h5>Conclusions & Recommendations</h5>
                <p>Based on the comprehensive analysis, the most significant findings regarding {searchQuery} include its impact, current trends, and potential future developments. Further research is recommended in areas where conflicting information was found across sources.</p>
              </div>
            </div>
          )}
        </div>

        <SentimentAnalysis results={searchResults} />
      </div>
    );
  };

  const renderContent = () => {
    if ((isSearching || isLocalSearching) && !(searchSummary || localSummary)) {
    return (
      <div className="search-loading agent-card">
          <div className={styles.spinner}></div>
                  <h4>{(isLocalSearching ? 'Local Search' : (agentStatus || 'Agent')).charAt(0).toUpperCase() + (isLocalSearching ? 'Local Search' : (agentStatus || 'Agent')).slice(1)}...</h4>
                  <p>{isLocalSearching ? `Running in-panel advanced search...` : (currentStep ? `Step ${completedSteps + 1}/${totalSteps}: ${currentStep.action} - ${currentStep.query}` : "Initiating research...")}</p>
                  <p className="loading-subtext">AION is executing its research plan...</p>

                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${isLocalSearching ? fetchProgress : progress}%` }}></div>
                    </div>
                    <span className="progress-text">{Math.round(isLocalSearching ? fetchProgress : progress)}% Complete</span>
                  </div>
            </div>
        );
    }

    if (agentStatus === 'error') {
       return (
           <div className="search-error agent-card">
              <h4>Research Failed</h4>
              <p>AION was unable to complete the research task.</p>
              <p className="error-message">{searchError || "An unknown error occurred."}</p>
              <button
                className="retry-button"
                onClick={() => onNewSearch(searchQuery)}
              >
                Retry Research
              </button>
           </div>
       )
    }

  if (!(searchSummary || localSummary) && !(isSearching || isLocalSearching)) {
        return (
            <div className="no-results agent-card">
                <h3>Welcome to the Advanced Research Panel</h3>
                <p>Ask AION to investigate any topic with deep, comprehensive analysis</p>
                <div className="example-prompts">
                   <button className="suggestion-button" onClick={() => onNewSearch("The impact of quantum computing on cryptography")}>
                      "The impact of quantum computing on cryptography"
                   </button>
                   <button className="suggestion-button" onClick={() => onNewSearch("Recent breakthroughs in generative AI")}>
                      "Recent breakthroughs in generative AI"
                   </button>
                   <button className="suggestion-button" onClick={() => onNewSearch("Climate change mitigation strategies 2024")}>
                      "Climate change mitigation strategies 2024"
                   </button>
                </div>

                {savedSessions.length > 0 && (
                  <div className="recent-searches">
                    <h4>Recent Research Sessions</h4>
                    <div className="saved-sessions">
                      {savedSessions.slice(0, 3).map(session => (
                        <div
                          key={session.id}
                          className="saved-session"
                          onClick={() => loadSession(session.id)}
                        >
                          <h5>{session.query}</h5>
                          <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                          <span>{session.results.length} results</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
        );
    }

    // Default view with results
    return (
        <>
            {renderSummary()}

            {/* Image Gallery Block */}
            {imageResults.length > 0 && (
              <div className="image-gallery-block agent-card">
                <ImageGallery images={imageResults} query={searchQuery} />
              </div>
            )}

            {searchResults.length > 0 && (
                <div className="search-results-container agent-card">
                    <div className="results-header">
                        <h4>Knowledge Sources ({searchResults.length})</h4>
                        <div className="results-controls">
                            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="sort-select">
                                <option value="relevance">Sort by Relevance</option>
                                <option value="date">Sort by Date</option>
                                <option value="title">Sort by Title</option>
                            </select>

                            <div className="view-mode-selector">
                              <button
                                className={viewMode === 'list' ? 'active' : ''}
                                onClick={() => setViewMode('list')}
                                title="List view"
                              >
                                <i className="icon-list"></i>
                              </button>
                              <button
                                className={viewMode === 'cluster' ? 'active' : ''}
                                onClick={() => setViewMode('cluster')}
                                title="Cluster view"
                              >
                                <i className="icon-cluster"></i>
                              </button>
                              <button
                                className={viewMode === 'timeline' ? 'active' : ''}
                                onClick={() => setViewMode('timeline')}
                                title="Timeline view"
                              >
                                <i className="icon-timeline"></i>
                              </button>
                            </div>
                        </div>
                    </div>
                    {renderResults()}
                </div>
            )}
        </>
    );
  };

  return (
    <div className="search-panel">
      <div className="search-panel-header">
        <div className="header-main">
          <h3>Advanced Research Agent</h3>
          <div className="header-status">
            <span className={`status-indicator ${agentStatus}`}>{agentStatus}</span>
            {isSearching && <div className="progress-ring" style={{ '--progress': `${progress}%` }}></div>}
          </div>
        </div>

        <div className="header-controls">
          <div className="session-controls">
            <button onClick={saveCurrentSession} disabled={!searchResults.length} className="btn-primary">
              <i className="icon-save"></i> Save Session
            </button>

            {savedSessions.length > 0 && (
              <div className="dropdown">
                <button className="dropdown-toggle">
                  <i className="icon-history"></i> Load Session
                </button>
                <div className="dropdown-menu">
                  {savedSessions.map(session => (
                    <div key={session.id} className="dropdown-item" onClick={() => loadSession(session.id)}>
                      <div className="session-title">{session.query}</div>
                      <div className="session-meta">
                        <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                        <span>{session.results.length} results</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="view-mode-selector">
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
              <i className="icon-list"></i> List
            </button>
            <button className={viewMode === 'cluster' ? 'active' : ''} onClick={() => setViewMode('cluster')}>
              <i className="icon-cluster"></i> Cluster
            </button>
            <button className={viewMode === 'timeline' ? 'active' : ''} onClick={() => setViewMode('timeline')}>
              <i className="icon-timeline"></i> Timeline
            </button>
            <button className={assetsOpen ? 'active assets-toggle' : 'assets-toggle'} onClick={() => setAssetsOpen(a => !a)} title="Open Assets Library">
              <i className="icon-asset"></i> Assets
            </button>
          </div>
        </div>
      </div>

  <div className={styles.sciFiHero}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <div>
            <div className={styles.sciFiTitle}>AION Search</div>
            <div className={styles.sciFiSub}>Deep web-scale retrieval • multi-provider hybrid search • instant insights</div>
          </div>
          <div style={{opacity:0.85, fontSize:'0.9rem'}}>Status: <strong style={{color: agentStatus?.running ? '#8ef' : '#f88'}}>{agentStatus?.running ? 'Online' : 'Offline'}</strong></div>
        </div>

        <div className={styles.searchInputContainer}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              value={query}
              placeholder="Ask AION to research a new topic..."
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSearching}
              className={styles.searchInput}
            />
            <button className={styles.searchActionBtn} onClick={() => handleAdvancedSearch(query)} aria-label="Run search">Search</button>

            <div className={styles.suggestionChips}>
              {(suggestedQueries || []).slice(0,6).map((s, i) => (
                <div key={i} className={styles.chip} onClick={() => { setQuery(s); handleAdvancedSearch(s); }}>{s}</div>
              ))}
            </div>
          </div>

          {/* Provider selector for hybrid search */}
          <div className={styles.providerSelector} role="group" aria-label="Search providers">
            <label className={`${styles.providerToggle} ${providers.aion ? styles.providerToggleActive : ''}`} title="AION (local)" tabIndex={0}>
              <input aria-label="Toggle AION provider" type="checkbox" checked={providers.aion} onChange={() => toggleProvider('aion')} />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.providerIcon}>
                <path fill="currentColor" d="M12 2l3.5 6.5L22 10l-5 4.5L18 22l-6-3.5L6 22l1-7.5L2 10l6.5-1.5L12 2z" />
              </svg>
              <span>AION</span>
            </label>

            <label className={`${styles.providerToggle} ${providers.google ? styles.providerToggleActive : ''}`} title="Google" tabIndex={0}>
              <input aria-label="Toggle Google provider" type="checkbox" checked={providers.google} onChange={() => toggleProvider('google')} />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.providerIcon}>
                <path fill="currentColor" d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>Google</span>
            </label>

            <label className={`${styles.providerToggle} ${providers.youtube ? styles.providerToggleActive : ''}`} title="YouTube" tabIndex={0}>
              <input aria-label="Toggle YouTube provider" type="checkbox" checked={providers.youtube} onChange={() => toggleProvider('youtube')} />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.providerIcon}>
                <rect x="2" y="6" width="20" height="12" rx="3" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <polygon points="10,9 16,12 10,15" fill="currentColor" />
              </svg>
              <span>YouTube</span>
            </label>

            <label className={`${styles.providerToggle} ${providers.reddit ? styles.providerToggleActive : ''}`} title="Reddit" tabIndex={0}>
              <input aria-label="Toggle Reddit provider" type="checkbox" checked={providers.reddit} onChange={() => toggleProvider('reddit')} />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.providerIcon}>
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="9" cy="11" r="1" fill="currentColor" />
                  <circle cx="15" cy="11" r="1" fill="currentColor" />
                  <path d="M8 15c1.333 1 3.333 1 5 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span>Reddit</span>
              </label>
            </div>

            {query.length > 2 && (
            <div className={styles.querySuggestionsPopup}>
              {suggestedQueries.filter(s => s.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5)
                .map((suggestion, index) => (
                  <div key={index} className={styles.suggestionItem} onClick={() => setQuery(suggestion)}>
                    {suggestion}
                  </div>
                ))
              }
            </div>
          )}
        </div>

        <AdvancedFilters filters={filters} onFilterChange={handleFilterChange} />

        <button
          onClick={() => { if (query.trim()) handleAdvancedSearch(query); }}
          disabled={!query.trim() || isSearching || isLocalSearching}
          className={`${styles.searchButton} btn-primary`}
        >
          {(isSearching || isLocalSearching) ? (
            <>
              <div className={styles.spinner}></div>
              {(isLocalSearching && fetchProgress > 0) ? `Searching... ${fetchProgress}%` : 'Researching...'}
            </>
          ) : (
            <>
              <i className="icon-search"></i>
              Advanced Search
            </>
          )}
        </button>

        {/* Local search progress / error */}
        {isLocalSearching && (
          <div className={styles.localSearchProgress}>
            <div className={`${styles.progressBar} small`}>
              <div className={styles.progressFill} style={{ width: `${fetchProgress}%` }}></div>
            </div>
            <span className={styles.progressText}>Local search: {fetchProgress}%</span>
          </div>
        )}

        {localSearchError && (
          <div className="local-search-error">Error: {localSearchError}</div>
        )}

        <div className="export-options">
          <button onClick={() => handleAdvancedExport('markdown')}>Export MD</button>
          <button onClick={() => handleAdvancedExport('json')}>Export JSON</button>
          <button onClick={() => handleAdvancedExport('csv')}>Export CSV</button>
        </div>
      </div>

      {/* Knowledge Graph Card */}
      {keyEntities && keyEntities.length > 0 && (
        <div className="knowledge-graph-card agent-card">
            <div className="card-header">
              <h4>Knowledge Graph: "{searchQuery}"</h4>
              <button
                className="expand-graph-btn"
                onClick={() => setGraphExpanded(!graphExpanded)}
              >
                {graphExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
            <KnowledgeGraph
                query={searchQuery}
                entities={keyEntities}
                onNodeClick={(entity) => {
                    setQuery(entity);
                    onNewSearch(entity);
                }}
                expanded={graphExpanded}
            />
        </div>
      )}

  {/* Assets Library Card */}
  <AssetsLibrary open={assetsOpen} />

      {/* Media and News panels (replacing Research Process / Timeline) */}
      <MediaPanel images={imageResults} videos={videoResults} query={searchQuery} />
      <NewsPanel results={normalizedResults} query={searchQuery} />

      {/* Main Results Area */}
      {renderContent()}

      {/* Suggested Queries */}
      {suggestedQueries.length > 0 && (
        <div className="suggested-queries agent-card">
          <h4>Related Research Topics</h4>
          <div className="query-suggestions">
            {suggestedQueries.map((suggestion, index) => (
              <button
                key={index}
                className="query-suggestion"
                onClick={() => onNewSearch(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Agent Process Section */}
    <div className="agent-process-section">
      {/* Replaced Research Plan with NewsPanel + MediaPanel above; keep Thought Process if requested */}
      <div className="collapsible-section">
        <div className="section-header" onClick={() => setThoughtsVisible(!thoughtsVisible)}>
          <h4>Agent Thought Process</h4>
          <span className="toggle-icon">{thoughtsVisible ? '▼' : '▶'}</span>
        </div>
        {thoughtsVisible && (
          <div className="section-content">
            <div className="thought-log">
              {thoughtProcessLog.map((thought, index) => (
                <div key={index} className="thought-entry">
                  <span className="thought-time">{thought.timestamp}</span>
                  <p>{thought.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default SearchPanel;