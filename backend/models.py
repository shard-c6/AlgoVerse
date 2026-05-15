from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Algorithm(Base):
    __tablename__ = "algorithms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text)
    complexity_class = Column(String(50)) # e.g. O(n log n), O(n^2)
    created_at = Column(DateTime, default=datetime.utcnow)

    benchmark_runs = relationship("BenchmarkRun", back_populates="algorithm")
    visualization_sessions = relationship("VisualizationSession", back_populates="algorithm")

class BenchmarkRun(Base):
    __tablename__ = "benchmark_runs"

    id = Column(Integer, primary_key=True, index=True)
    algorithm_id = Column(Integer, ForeignKey("algorithms.id", ondelete="CASCADE"))
    language = Column(String(50), nullable=False)
    input_size = Column(Integer, nullable=False)
    execution_time_ms = Column(Float, nullable=False)
    comparisons = Column(Integer)
    swaps = Column(Integer)
    allocations = Column(Integer)
    memory_used_kb = Column(Float)
    metrics_json = Column(JSON, nullable=False)
    run_date = Column(DateTime, default=datetime.utcnow)

    algorithm = relationship("Algorithm", back_populates="benchmark_runs")

class VisualizationSession(Base):
    __tablename__ = "visualization_sessions"

    id = Column(Integer, primary_key=True, index=True)
    algorithm_id = Column(Integer, ForeignKey("algorithms.id", ondelete="CASCADE"))
    language = Column(String(50), nullable=False)
    input_size = Column(Integer, nullable=False)
    events_json = Column(JSON, nullable=False)
    session_date = Column(DateTime, default=datetime.utcnow)

    algorithm = relationship("Algorithm", back_populates="visualization_sessions")
